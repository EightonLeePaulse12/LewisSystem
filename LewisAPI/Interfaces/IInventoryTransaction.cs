using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IInventoryTransaction
    {
        Task AddAsync(InventoryTransaction transaction);
    }
}
