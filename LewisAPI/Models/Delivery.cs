using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class Delivery
    {
        [Key]
        public Guid DeliveryId { get; set; }

        public Guid OrderId { get; set; }

        [MaxLength(100)]
        public string Courier { get; set; }

        [MaxLength(100)]
        public string TrackingNumber { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fee { get; set; }

        public DateTime? EstimatedDeliveryDate { get; set; }

        [Required]
        public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;

        [ForeignKey("OrderId")]
        [InverseProperty("Delivery")]
        public virtual Order Order { get; set; }
    }
}
