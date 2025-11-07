using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class Payment
    {
        [Key]
        public Guid PaymentId { get; set; }

        public Guid? OrderId { get; set; }

        public Guid? AgreementId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string Method { get; set; }

        [MaxLength(100)]
        public string Reference { get; set; }

        public Guid? ReceivedBy { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }

        [ForeignKey("AgreementId")]
        public virtual CreditAgreement Agreement { get; set; }

        [ForeignKey("ReceivedBy")]
        public virtual ApplicationUser ReceivedByUser { get; set; }
    }
}
