using LewisAPI.Models;
using Microsoft.AspNetCore.Http;

namespace LewisAPI.DTOs
{
    public class CreateProductDto
    {
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
        public ProductStatus Status { get; set; }

        public IFormFile? ImageUrl { get; set; }
    }
}
