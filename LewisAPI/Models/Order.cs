using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class Order
    {
        [Key]
        public Guid OrderId { get; set; }

        public Guid CustomerId { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal SubTotal { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Tax { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [Required]
        public PaymentType PaymentType { get; set; }

        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; }

        public virtual ICollection<Payment> Payments { get; set; }

        public virtual Delivery Delivery { get; set; } // One-to-one

        public virtual CreditAgreement CreditAgreement { get; set; } // One-to-one for credit
    }
}
