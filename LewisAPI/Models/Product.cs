using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LewisAPI.Models
{
    [Index(nameof(SKU), IsUnique = true)] // Unique index on SKU
    [Index(nameof(Name))] // Non-unique index on Name
    public class Product
    {
        [Key]
        public Guid ProductId { get; set; }

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public int? CategoryId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2")]
        public decimal CostPrice { get; set; }

        public decimal? Weight { get; set; }

        [MaxLength(100)]
        public string? Dimensions { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQty { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ReorderThreshold { get; set; }

        [Required]
        public ProductStatus Status { get; set; }

        public byte[]? Image1 { get; set; }
        public byte[]? Image2 { get; set; }
        public byte[]? Image3 { get; set; }
        public bool IsDeleted { get; set; } 

        [Timestamp] // Or [ConcurrencyCheck] if using a non-byte[] type
        public byte[] RowVersion { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }

        public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}
