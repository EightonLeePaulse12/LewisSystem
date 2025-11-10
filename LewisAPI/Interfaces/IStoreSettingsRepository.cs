using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IStoreSettingsRepository
    {
        Task<IEnumerable<StoreSettings>> GetSettingsAsync();

        Task UpdateSettingsAsync(StoreSettings updated);
    }
}
