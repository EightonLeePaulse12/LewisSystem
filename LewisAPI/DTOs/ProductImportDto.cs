using CsvHelper.Configuration.Attributes; // Optional, but good for safety
using LewisAPI.Models; // For ProductStatus enum

namespace LewisAPI.DTOs
{
    public class ProductImportDto
    {
        // We make ID nullable so the system can generate new ones if missing
        public Guid? ProductId { get; set; }
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

        // CsvHelper handles "Active"/"Inactive" text to Enum conversion automatically
        public ProductStatus Status { get; set; }

        // --- CRITICAL CHANGE HERE ---
        // These must be strings to read the text from the CSV
        public string? Image1 { get; set; }
        public string? Image2 { get; set; }
        public string? Image3 { get; set; }
        // ----------------------------

        public bool IsDeleted { get; set; }
    }
}