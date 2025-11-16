using LewisAPI.Models;

namespace LewisAPI.Services
{
    public class InstallmentService
    {
        private readonly IConfiguration _config;

        public InstallmentService(IConfiguration config)
        {
            _config = config;
        }

        public List<Installment> GenerateSchedule(decimal principal, decimal interestRate, int termMonths, DateTime startDate, decimal deposit = 0, decimal setupFee = 0)
        {
            principal += setupFee - deposit; // Apply deposit to principal
            if (principal <= 0) throw new ArgumentException("Principal after adjustments must be positive.");

            decimal monthlyRate = interestRate / 12 / 100; // Annual to monthly
            if (monthlyRate == 0) throw new ArgumentException("Interest rate must be positive for credit.");

            // Standard amortization formula
            double pow = Math.Pow(1 + (double)monthlyRate, termMonths);
            decimal monthlyPayment = principal * (monthlyRate * (decimal)pow) / ((decimal)pow - 1);
            monthlyPayment = Math.Round(monthlyPayment, 2); // Round to currency precision

            var installments = new List<Installment>();
            decimal balance = principal;
            DateTime dueDate = startDate.AddMonths(1); // First installment next month (configurable if needed)

            for (int i = 1; i <= termMonths; i++)
            {
                decimal interest = Math.Round(balance * monthlyRate, 2);
                decimal principalComponent = Math.Round(monthlyPayment - interest, 2);
                balance = Math.Round(balance - principalComponent, 2);

                // Adjust last payment for rounding
                if (i == termMonths && balance > 0)
                {
                    principalComponent += balance;
                    monthlyPayment += balance;
                    balance = 0;
                }

                installments.Add(new Installment
                {
                    DueDate = dueDate,
                    AmountDue = monthlyPayment,
                    InterestComponent = interest,
                    PrincipalComponent = principalComponent,
                    Status = InstallmentStatus.Pending
                });

                dueDate = dueDate.AddMonths(1);
            }

            return installments;
        }
    }
}
