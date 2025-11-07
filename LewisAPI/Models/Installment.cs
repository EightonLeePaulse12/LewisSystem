using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class Installment
    {
        [Key]
        public Guid InstallmentId { get; set; }

        public Guid AgreementId { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountDue { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrincipalComponent { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal InterestComponent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; } = 0;

        public DateTime? PaidDate { get; set; }

        [Required]
        public InstallmentStatus Status { get; set; } = InstallmentStatus.Pending;

        [ForeignKey("AgreementId")]
        public virtual CreditAgreement Agreement { get; set; }
    }
}
