using LewisAPI.DTOs;
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

        Task<string> InitiatePaymentAsync(decimal amount, string email, string reference, string callbackUrl = null, Dictionary<string, string> metadata = null);

        Task ProcessPaymentAsync(Payment payment, string email, string reference);
        Task<VerificationResult> VerifyPaymentAsync(string transactionId);

        Task VerifyWebhookAsync(HttpRequest request);

        Task ApplyLateFeesAsync();
    }
}
