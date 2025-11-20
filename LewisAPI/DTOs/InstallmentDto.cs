using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class InstallmentDto
    {
        public Guid InstallmentId { get; set; }
        public DateTime DueDate { get; set; }
        public decimal AmountDue { get; set; }
        public decimal PrincipalComponent { get; set; }
        public decimal InterestComponent { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime? PaidDate { get; set; }
        public InstallmentStatus Status { get; set; }
    }
}
