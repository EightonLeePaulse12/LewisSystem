using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;
using PayStack.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LewisAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly PayStackApi _paystack;
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogRepository _auditLogRepo;
        private readonly HttpClient _httpClient;

        public PaymentService(
            IConfiguration config,
            ApplicationDbContext context,
            IAuditLogRepository auditLogRepo,
            HttpClient httpClient
        )
        {
            _config = config;
            _context = context;
            _auditLogRepo = auditLogRepo;
            _httpClient = httpClient;
            _paystack = new PayStackApi(config["Paystack:SecretKey"]);
        }

        public decimal CalculateMonthlyInstallment(
            decimal principal,
            decimal annualRate,
            int months
        )
        {
            if (months <= 0)
                throw new ArgumentException("Months must be positive.");

            decimal monthlyRate = annualRate / 12;
            if (monthlyRate == 0)
                return principal / months;

            double pow = Math.Pow(1 + (double)monthlyRate, months);
            decimal monthly = principal * (monthlyRate * (decimal)pow) / ((decimal)pow - 1);
            return Math.Round(monthly, 2);
        }

        public async Task<List<Installment>> GenerateInstallmentScheduleAsync(
            CreditAgreement agreement,
            decimal deposit = 0,
            Guid userId = default
        )
        {
            if (agreement == null)
                throw new ArgumentNullException(nameof(agreement));

            if (agreement.Principal <= 0)
                throw new ArgumentException("Principal must be positive.");

            if (agreement.InterestRate < 0)
                throw new ArgumentException("Interest rate cannot be negative.");

            if (agreement.TermMonths <= 0 || agreement.TermMonths > 36)
                throw new ArgumentException("Term must be between 1 and 36 months.");

            var schedule = new List<Installment>();
            decimal principal = agreement.Principal - deposit;

            if (principal <= 0)
                throw new ArgumentException("Principal after deposit must be positive.");

            decimal monthlyRate = agreement.InterestRate / 12;
            decimal monthlyPayment = CalculateMonthlyInstallment(
                principal,
                agreement.InterestRate,
                agreement.TermMonths
            );

            // Handle different plan types
            if (agreement.PlanType == CreditPlanType.Simple)
            {
                decimal totalInterest = principal * agreement.InterestRate * agreement.TermMonths / 12;
                monthlyPayment = (principal + totalInterest) / agreement.TermMonths;
            }

            decimal balance = principal;
            DateTime dueDate = agreement.StartDate.AddMonths(1);

            for (int i = 1; i <= agreement.TermMonths; i++)
            {
                decimal interest = Math.Round(balance * monthlyRate, 2);
                decimal principalPay = Math.Round(monthlyPayment - interest, 2);
                balance = Math.Round(balance - principalPay, 2);

                // Adjust for rounding on last installment
                if (i == agreement.TermMonths && balance != 0)
                {
                    principalPay += balance;
                    monthlyPayment = interest + principalPay;
                    balance = 0;
                }

                var installment = new Installment
                {
                    InstallmentId = Guid.NewGuid(),
                    AgreementId = agreement.AgreementId,
                    DueDate = dueDate,
                    AmountDue = monthlyPayment,
                    InterestComponent = interest,
                    PrincipalComponent = principalPay,
                    AmountPaid = 0,
                    PaidDate = null,
                    Status = InstallmentStatus.Pending,
                };
                schedule.Add(installment);

                dueDate = dueDate.AddMonths(1);
            }

            agreement.OutstandingBalance = principal;
            agreement.NextDueDate = schedule.FirstOrDefault()?.DueDate;
            agreement.Status = CreditAgreementStatus.Active;
            _context.CreditAgreements.Update(agreement);
            await _context.SaveChangesAsync();

            string details = JsonSerializer.Serialize(agreement);

            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = userId != null || userId != Guid.Empty ? userId : null,
                Action = "Create",
                EntityType = "CreditAgreement",
                EntityId = agreement.AgreementId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = details,
            };
            await _auditLogRepo.LogAsync(auditLog);

            return schedule;
        }

        public async Task<string> InitiatePaymentAsync(
            decimal amount,
            string email,
            string reference,
            string callbackUrl = null,
            Dictionary<string, string> metadata = null
        )
        {
            if (amount <= 0)
                throw new ArgumentException("Amount must be positive.");

            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.");

            if (string.IsNullOrWhiteSpace(reference))
                throw new ArgumentException("Reference is required.");

            var request = new TransactionInitializeRequest
            {
                AmountInKobo = (int)(amount * 100),
                Email = email,
                Reference = reference,
                CallbackUrl = callbackUrl ?? _config["Paystack:CallbackUrl"]
            };

            if (metadata != null && metadata.Count > 0)
            {
                request.MetadataObject = metadata.ToDictionary(kvp => kvp.Key, kvp => (object)kvp.Value);
            }

            var response = _paystack.Transactions.Initialize(request);

            if (response.Status)
            {
                return response.Data.AuthorizationUrl;
            }

            throw new Exception($"Paystack initialization failed: {response.Message}");
        }

        public async Task VerifyWebhookAsync(HttpRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            string body;
            using (var reader = new StreamReader(request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            var secretKey = _config["Paystack:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
                throw new Exception("Paystack secret key not configured.");

            var signature = request.Headers["x-paystack-signature"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(signature))
                throw new Exception("Missing Paystack signature header.");

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
            var computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();

            if (signature != computedSignature)
            {
                throw new Exception("Invalid Paystack webhook signature");
            }

            var eventData = JsonSerializer.Deserialize<PaystackWebhookEvent>(body);
            if (eventData == null || eventData.Event != "charge.success")
            {
                return;
            }

            var verifyResponse = _paystack.Transactions.Verify(eventData.Data.Reference);
            if (!verifyResponse.Status || verifyResponse.Data.Status != "success")
            {
                throw new Exception("Payment verification failed");
            }

            var metadata = verifyResponse.Data.Metadata as Dictionary<string, object>;
            Guid? orderId = null;
            Guid? agreementId = null;
            Guid? receivedBy = null;

            if (metadata != null)
            {
                if (metadata.TryGetValue("orderId", out var ord) && Guid.TryParse(ord?.ToString(), out var parsedOrdId))
                    orderId = parsedOrdId;

                if (metadata.TryGetValue("agreementId", out var agr) && Guid.TryParse(agr?.ToString(), out var parsedAgrId))
                    agreementId = parsedAgrId;

                if (metadata.TryGetValue("userId", out var usr) && Guid.TryParse(usr?.ToString(), out var parsedUsrId))
                    receivedBy = parsedUsrId;
            }

            var payment = new Payment
            {
                PaymentId = Guid.NewGuid(),
                OrderId = orderId,
                AgreementId = agreementId,
                Amount = (decimal)verifyResponse.Data.Amount / 100,
                PaymentDate = DateTime.UtcNow,
                Method = "Paystack",
                Reference = verifyResponse.Data.Reference,
                ReceivedBy = receivedBy
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if (agreementId.HasValue)
            {
                var agreement = await _context.CreditAgreements.FindAsync(agreementId);
                if (agreement != null)
                {
                    agreement.OutstandingBalance -= payment.Amount;
                    if (agreement.OutstandingBalance <= 0)
                        agreement.Status = CreditAgreementStatus.Completed;

                    var next = await _context
                        .Installments.Where(i =>
                            i.AgreementId == agreementId
                            && i.Status == InstallmentStatus.Pending
                        )
                        .OrderBy(i => i.DueDate)
                        .FirstOrDefaultAsync();
                    agreement.NextDueDate = next?.DueDate;

                    _context.CreditAgreements.Update(agreement);
                    await _context.SaveChangesAsync();

                    // Update installment status if paid
                    var installments = await _context.Installments
                        .Where(i => i.AgreementId == agreementId && i.Status == InstallmentStatus.Pending)
                        .OrderBy(i => i.DueDate)
                        .ToListAsync();

                    decimal remainingPayment = payment.Amount;
                    foreach (var installment in installments)
                    {
                        if (remainingPayment <= 0) break;

                        decimal dueRemaining = installment.AmountDue - installment.AmountPaid;
                        if (remainingPayment >= dueRemaining)
                        {
                            installment.AmountPaid = installment.AmountDue;
                            installment.Status = InstallmentStatus.Paid;
                            installment.PaidDate = DateTime.UtcNow;
                            remainingPayment -= dueRemaining;
                        }
                        else
                        {
                            installment.AmountPaid += remainingPayment;
                            remainingPayment = 0;
                        }
                        _context.Installments.Update(installment);
                    }
                    await _context.SaveChangesAsync();
                }
            }
            else if (orderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null && order.PaymentType == PaymentType.Cash)
                {
                    order.Status = OrderStatus.Confirmed;
                    _context.Orders.Update(order);
                    await _context.SaveChangesAsync();
                }
            }

            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = payment.ReceivedBy ?? Guid.Empty,
                Action = "Create",
                EntityType = "Payment",
                EntityId = payment.PaymentId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"Amount: {payment.Amount}, Reference: {payment.Reference}"
            };
            await _auditLogRepo.LogAsync(auditLog);
        }

        public async Task ProcessPaymentAsync(Payment payment, string email, string reference)
        {
            if (payment == null)
                throw new ArgumentNullException(nameof(payment));

            if (payment.Amount <= 0)
                throw new ArgumentException("Payment amount must be positive.");

            payment.Method = "Manual";
            payment.PaymentDate = DateTime.UtcNow;
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if (payment.AgreementId.HasValue)
            {
                var agreement = await _context.CreditAgreements.FindAsync(payment.AgreementId);
                if (agreement != null)
                {
                    agreement.OutstandingBalance -= payment.Amount;
                    if (agreement.OutstandingBalance <= 0)
                        agreement.Status = CreditAgreementStatus.Completed;

                    var next = await _context
                        .Installments.Where(i =>
                            i.AgreementId == payment.AgreementId
                            && i.Status == InstallmentStatus.Pending
                        )
                        .OrderBy(i => i.DueDate)
                        .FirstOrDefaultAsync();
                    agreement.NextDueDate = next?.DueDate;

                    _context.CreditAgreements.Update(agreement);
                    await _context.SaveChangesAsync();

                    // Update installment status if paid
                    var installments = await _context.Installments
                        .Where(i => i.AgreementId == payment.AgreementId && i.Status == InstallmentStatus.Pending)
                        .OrderBy(i => i.DueDate)
                        .ToListAsync();

                    decimal remainingPayment = payment.Amount;
                    foreach (var installment in installments)
                    {
                        if (remainingPayment <= 0) break;

                        decimal dueRemaining = installment.AmountDue - installment.AmountPaid;
                        if (remainingPayment >= dueRemaining)
                        {
                            installment.AmountPaid = installment.AmountDue;
                            installment.Status = InstallmentStatus.Paid;
                            installment.PaidDate = DateTime.UtcNow;
                            remainingPayment -= dueRemaining;
                        }
                        else
                        {
                            installment.AmountPaid += remainingPayment;
                            remainingPayment = 0;
                        }
                        _context.Installments.Update(installment);
                    }
                    await _context.SaveChangesAsync();
                }
            }
            else if (payment.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(payment.OrderId);
                if (order != null && order.PaymentType == PaymentType.Cash)
                {
                    order.Status = OrderStatus.Confirmed;
                    _context.Orders.Update(order);
                    await _context.SaveChangesAsync();
                }
            }

            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = payment.ReceivedBy ?? Guid.Empty,
                Action = "Create",
                EntityType = "Payment",
                EntityId = payment.PaymentId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"Amount: {payment.Amount}"
            };
            await _auditLogRepo.LogAsync(auditLog);
        }

        public async Task<VerificationResult> VerifyPaymentAsync(string reference)
        {
            if (string.IsNullOrWhiteSpace(reference))
                throw new ArgumentException("Reference is required.");

            var secretKey = _config.GetValue<string>("Paystack:SecretKey");
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new Exception("Paystack secret key not configured.");
            }

            var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.paystack.co/transaction/verify/{reference}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            try
            {
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    return new VerificationResult
                    {
                        Success = false,
                        Message = $"Verification failed with status code {response.StatusCode}"
                    };
                }

                var content = await response.Content.ReadAsStringAsync();
                var paystackResponse = JsonSerializer.Deserialize<PaystackVerifyResponse>(content);

                if (paystackResponse == null || !paystackResponse.Status || paystackResponse.Data.Status != "success")
                {
                    return new VerificationResult
                    {
                        Success = false,
                        Message = paystackResponse?.Message ?? "Verification failed"
                    };
                }

                return new VerificationResult
                {
                    Success = true,
                    Amount = paystackResponse.Data.Amount / 100m,
                    Message = "Payment verified successfully"
                };
            }
            catch (HttpRequestException ex)
            {
                return new VerificationResult
                {
                    Success = false,
                    Message = $"HTTP request failed: {ex.Message}"
                };
            }
        }

        public async Task ApplyLateFeesAsync()
        {
            var overdue = await _context
                .Installments.Where(i =>
                    i.DueDate < DateTime.UtcNow && i.Status == InstallmentStatus.Pending
                )
                .ToListAsync();

            decimal lateFeeRate = _config.GetValue<decimal>("StoreSettings:LateFeeRate", 0.05m);

            foreach (var i in overdue)
            {
                decimal lateFee = Math.Round(i.AmountDue * lateFeeRate, 2);
                i.AmountDue += lateFee;
                i.Status = InstallmentStatus.Overdue;
                _context.Installments.Update(i);

                var auditLog = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = Guid.Empty,
                    Action = "Update",
                    EntityType = "Installment",
                    EntityId = i.InstallmentId.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = $"Applied late fee: {lateFee}"
                };
                await _auditLogRepo.LogAsync(auditLog);
            }

            await _context.SaveChangesAsync();
        }
    }

    // Helper class for webhook event
    public class PaystackWebhookEvent
    {
        public string Event { get; set; }
        public PaystackWebhookData Data { get; set; }
    }

    public class PaystackWebhookData
    {
        public string Reference { get; set; }
        public int Amount { get; set; } // In kobo
        public Dictionary<string, object> Metadata { get; set; }
    }
}

public class PaystackVerifyResponse
{
    public bool Status { get; set; }
    public string Message { get; set; }
    public PaystackData Data { get; set; }
}

public class PaystackData
{
    public string Status { get; set; }
    public decimal Amount { get; set; }
}
