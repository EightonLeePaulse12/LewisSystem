using System.Text.Json;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace LewisAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogRepository _auditLogRepo;

        public PaymentService(
            IConfiguration config,
            ApplicationDbContext context,
            IAuditLogRepository auditLogRepo
        )
        {
            _config = config;
            _context = context;
            _auditLogRepo = auditLogRepo;
        }

        public decimal CalculateMonthlyInstallment(
            decimal principal,
            decimal annualRate,
            int months
        )
        {
            decimal monthlyRate = annualRate / 12;
            if (monthlyRate == 0)
                return principal / months;

            double pow = Math.Pow(1 + (double)monthlyRate, months);
            decimal monthly = principal * (monthlyRate * (decimal)pow) / ((decimal)pow - 1);
            return monthly;
        }

        public async Task<List<Installment>> GenerateInstallmentScheduleAsync(
            CreditAgreement agreement,
            decimal deposit = 0,
            Guid userId = default
        )
        {
            var schedule = new List<Installment>();
            decimal principal = agreement.Principal - deposit;
            decimal monthlyRate = agreement.InterestRate / 12;
            decimal monthlyPayment = CalculateMonthlyInstallment(
                principal,
                agreement.InterestRate,
                agreement.TermMonths
            );

            decimal balance = principal;
            DateTime dueDate = agreement.StartDate.AddMonths(1);

            for (int i = 1; i <= agreement.TermMonths; i++)
            {
                decimal interest = balance * monthlyRate;
                decimal principalPay = monthlyPayment - interest;
                balance -= principalPay;

                var installment = new Installment
                {
                    InstallmentId = Guid.NewGuid(),
                    AgreementId = agreement.AgreementId,
                    DueDate = dueDate,
                    AmountDue = monthlyPayment,
                    InterestComponent = interest,
                    PrincipalComponent = principalPay,
                    AmountPaid = 0,
                    Status = InstallmentStatus.Pending,
                };
                schedule.Add(installment);

                dueDate = dueDate.AddMonths(1);
            }

            agreement.OutstandingBalance = principal;
            agreement.NextDueDate = schedule.FirstOrDefault()?.DueDate;
            _context.CreditAgreements.Update(agreement);
            await _context.SaveChangesAsync();

            string details = JsonSerializer.Serialize(agreement);

            var auditLog = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                Action = "Create",
                EntityType = "CreditAgreement",
                EntityId = agreement.AgreementId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = details,
            };

            // Then update the LogAsync call to use the auditLog object:
            await _auditLogRepo.LogAsync(auditLog);

            return schedule;
        }

        public async Task ProcessPaymentAsync(Payment payment, string? stripeToken)
        {
            if (!string.IsNullOrEmpty(stripeToken))
            {
                var chargeOptions = new ChargeCreateOptions
                {
                    Amount = (long)(payment.Amount * 100),
                    Currency = _config.GetValue<string>("StoreSettings:Currency", "zar"),
                    Description = $"Payment for {payment.OrderId ?? payment.AgreementId}",
                    Source = stripeToken,
                };

                var service = new ChargeService();
                var charge = await service.CreateAsync(chargeOptions);

                payment.Reference = charge.Id;
                payment.Method = "Stripe";
            }
            else
            {
                payment.Method = "Manual";
            }

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if (payment.AgreementId.HasValue)
            {
                var agreement = await _context.CreditAgreements.FindAsync(payment.AgreementId);
                if (agreement != null)
                {
                    agreement.OutstandingBalance -= payment.Amount;

                    var next = await _context
                        .Installments.Where(i =>
                            i.AgreementId == payment.AgreementId
                            && i.Status == InstallmentStatus.Pending
                        )
                        .OrderBy(i => i.DueDate)
                        .FirstOrDefaultAsync();
                    agreement.NextDueDate = next?.DueDate;

                    await _context.SaveChangesAsync();
                }
            }
            else if (payment.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(payment.OrderId);
                if (order != null && order.PaymentType == PaymentType.Cash)
                {
                    order.Status = OrderStatus.Confirmed;
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
                Details = $"Amount: {payment.Amount}",
            };
            await _auditLogRepo.LogAsync(auditLog);
        }

        public async Task ApplyLateFeesAsync()
        {
            var overdue = await _context
                .Installments.Where(i =>
                    i.DueDate < DateTime.UtcNow && i.Status == InstallmentStatus.Pending
                )
                .ToListAsync();

            decimal lateFeeRate = _config.GetValue<decimal>("StoreSettings:LateFeeRate", 0.05m); // 5% configurable

            foreach (var i in overdue)
            {
                decimal lateFee = i.AmountDue * lateFeeRate;
                i.AmountDue += lateFee;
                i.Status = InstallmentStatus.Overdue;
                // Log audit or notify
            }

            await _context.SaveChangesAsync();
        }
    }
}
