using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class UpdateProductDto
    {
        public string? SKU { get; set; }  // Nullable for partial updates
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? Weight { get; set; }
        public string? Dimensions { get; set; }
        public int? StockQty { get; set; }  // Allow updating qty for inventory adjustments
        public int? ReorderThreshold { get; set; }
        public ProductStatus? Status { get; set; }
        // No Image1 or base64 string—use separate endpoint for images
    }
}