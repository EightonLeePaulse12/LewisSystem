using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class ProductDto
    {
        public Guid ProductId { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal CostPrice { get; set; }
        public decimal? Weight { get; set; }
        public string? Dimensions { get; set; }
        public int StockQty { get; set; }
        public int ReorderThreshold { get; set; }
        public ProductStatus Status { get; set; } // Assume enum from your models
        public byte[]? Image1 { get; set; }
        public byte[]? Image2 { get; set; }
        public byte[]? Image3 { get; set; }
        public bool IsDeleted { get; set; }
    }
}
