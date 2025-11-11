using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync(int page, int limit, string? filter = null); // Pagination + filters

        Task<Product?> GetByIdAsync(Guid id);

        Task<Product> CreateAsync(Product product);

        Task UpdateAsync(Product product);

        Task SoftDeleteAsync(Guid id);

        Task ImportBatchAsync(IEnumerable<Product> products); // For CSV import

        Task<IEnumerable<Product>> ExportBatchAsync(); // For export
        Task HardDeleteAsync(Guid id);
    }
}
