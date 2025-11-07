using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class InventoryTransaction
    {
        [Key]
        public Guid TransactionId { get; set; }

        public Guid ProductId { get; set; }

        [Required]
        public int ChangeQty { get; set; }

        [Required]
        public InventoryTransactionType Type { get; set; }

        [MaxLength(500)]
        public string Note { get; set; }

        public Guid PerformedBy { get; set; }

        [Required]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }

        [ForeignKey("PerformedBy")]
        public virtual ApplicationUser PerformedByUser { get; set; }
    }
}
