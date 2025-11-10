using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.Extensions.Caching.Memory;

namespace LewisAPI.Repositories
{
    public class StoreSettingsRepository : IStoreSettingsRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        public StoreSettingsRepository(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<StoreSettings> GetSettingsAsync()
        {
            const string cacheKey = "StoreSettings";
            if (!_cache.TryGetValue(cacheKey, out StoreSettings? settings))
            {
                settings = await _context.StoreSettings.FindAsync(1);
                if (settings == null)
                {
                    settings = new StoreSettings
                    {
                        Id = 1,
                        DefaultInterestRate = 0.10m,
                        SetupFee = 50.00m,
                        DeliveryOptions = new Dictionary<string, decimal>
                        {
                            { "Local", 10.00m },
                            { "Regional", 50.00m },
                            { "National", 100.00m },
                        },
                        BillingCycleStart = "NextMonth",
                        GracePeriodDays = 0,
                        LateFeePercentage = 0.05m,
                        DefaultPlanType = "Amortized",
                    };
                    _context.StoreSettings.Add(settings);
                    await _context.SaveChangesAsync();
                }
                _cache.Set(cacheKey, settings, TimeSpan.FromHours(1));
            }
            return settings!;
        }

        public async Task UpdateSettingsAsync(StoreSettings updated)
        {
            var settings = await _context.StoreSettings.FindAsync(1);
            if (settings != null)
            {
                settings.DefaultInterestRate = updated.DefaultInterestRate;
                settings.SetupFee = updated.SetupFee;
                settings.DeliveryOptions = updated.DeliveryOptions ?? settings.DeliveryOptions;
                settings.BillingCycleStart =
                    updated.BillingCycleStart ?? settings.BillingCycleStart;
                settings.GracePeriodDays = updated.GracePeriodDays;
                settings.LateFeePercentage = updated.LateFeePercentage;
                settings.DefaultPlanType = updated.DefaultPlanType ?? settings.DefaultPlanType;
                settings.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _cache.Remove("StoreSettings");
            }
        }
    }
}
