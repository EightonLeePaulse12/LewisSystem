using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync(int page, int limit, Guid? userId = null);

        Task<Order?> GetByIdAsync(Guid id);

        Task CreateAsync(Order order);

        Task UpdateAsync(Order order);

        Task SoftDeleteAsync(Guid id);
    }
}
