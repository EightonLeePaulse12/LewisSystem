using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IStoreSettingsRepository
    {
        Task<StoreSettings> GetSettingsAsync();
        Task UpdateSettingsAsync(StoreSettings updated);
    }
}
