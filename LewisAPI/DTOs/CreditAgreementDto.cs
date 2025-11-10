using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class CreditAgreementDto
    {
        public Guid AgreementId { get; set; }
        public decimal Principal { get; set; }
        public decimal InterestRate { get; set; }
        public int TermMonths { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? NextDueDate { get; set; }
        public decimal OutstandingBalance { get; set; }
        public CreditAgreementStatus Status { get; set; }
        public List<InstallmentDto> Installments { get; set; }
    }
}
