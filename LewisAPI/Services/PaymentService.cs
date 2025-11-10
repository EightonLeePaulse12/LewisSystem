using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
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

        public Task<decimal> CalculateMonthlyInstallment(
            decimal principal,
            decimal annualRate,
            int months
        )
        {
            decimal monthlyRate = annualRate / 12;
            if (monthlyRate == 0)
                return principal / months; // No interest

            decimal pow = (decimal)Math.Pow(1 + (double)monthlyRate, months);
            decimal monthly = principal * (monthlyRate * pow) / (pow - 1);
            return monthly;
        }

        public async Task<List<Installment>> GenerateInstallmentScheduleAsync(
            CreditAgreement agreement,
            decimal deposit = 0
        )
        {
            var schedule = new List<Installment>();
            decimal principal = agreement.Principal - deposit;
            decimal monthlyRate = agreement.InterestRate / 12;
            decimal monthlyPayment = await CalculateMonthlyInstallment(
                principal,
                agreement.InterestRate,
                agreement.TermMonths
            );

            decimal balance = principal;
            DateTime dueDate = agreement.StartDate.AddMonths(1); // Configurable

            for (int i = 1; i <= agreement.TermMonths; i++)
            {
                decimal interest = balance * monthlyRate;
                decimal principalPay = monthlyPayment - interest;
                balance -= principalPay;

                var installment = new Installment
                {
                    AgreementId = agreement.AgreementId,
                    DueDate = dueDate,
                    AmountDue = monthlyPayment,
                    InterestComponent = interest,
                    PrincipalComponent = principalPay,
                    Status = "Pending",
                };
                schedule.Add(installment);

                dueDate = dueDate.AddMonths(1);
            }

            agreement.OutstandingBalance = principal - deposit;
            agreement.NextDueDate = schedule.First().DueDate;
            await _context.SaveChangesAsync();

            await _auditLogRepo.LogAsync(
                userId,
                "Create",
                "CreditAgreement",
                agreement.AgreementId.ToString(),
                details
            );

            return schedule;
        }

        public async Task ProcessPaymentAsync(Payment payment, string stripeToken)
        {
            var chargeOptions = new ChargeCreateOptions
            {
                Amount = (long)(payment.Amount * 100), // Cents
                Currency = "usd", // Or ZAR for ZA
                Description = $"Payment for {payment.OrderId ?? payment.AgreementId}",
                Source = stripeToken, // Test token from client
            };

            var service = new ChargeService();
            var charge = await service.CreateAsync(chargeOptions);

            payment.Reference = charge.Id;
            payment.Method = "Stripe";
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Update balance if credit
            if (payment.AgreementId.HasValue)
            {
                var agreement = await _context.CreditAgreements.FindAsync(payment.AgreementId);
                if (agreement != null)
                {
                    agreement.OutstandingBalance -= payment.Amount;
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}
