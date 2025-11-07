using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class CreditAgreement
    {
        [Key]
        public Guid AgreementId { get; set; }

        public Guid OrderId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Principal { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal InterestRate { get; set; }

        [Required]
        [Range(1, 36)]
        public int TermMonths { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? NextDueDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OutstandingBalance { get; set; }

        [Required]
        public CreditAgreementStatus Status { get; set; } = CreditAgreementStatus.Active;

        public CreditPlanType? PlanType { get; set; } // Optional

        [ForeignKey("OrderId")]
        [InverseProperty("CreditAgreement")]
        public virtual Order Order { get; set; }

        public virtual ICollection<Installment> Installments { get; set; }

        public virtual ICollection<Payment> Payments { get; set; }
    }
}
