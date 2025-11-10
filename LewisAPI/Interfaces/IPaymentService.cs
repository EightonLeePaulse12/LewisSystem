using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IPaymentService
    {
        decimal CalculateMonthlyInstallment(decimal principal, decimal annualRate, int months);
        Task<List<Installment>> GenerateInstallmentScheduleAsync(
            CreditAgreement agreement,
            decimal deposit = 0,
            Guid userId = default
        );
        Task ProcessPaymentAsync(Payment payment, string? stripeToken);
    }
}
