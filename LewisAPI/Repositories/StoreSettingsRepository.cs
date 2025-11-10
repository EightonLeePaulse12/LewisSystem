using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;
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

        public async Task<IEnumerable<StoreSettings>> GetSettingsAsync()
        {
            return await _context.StoreSettings.ToListAsync();
        }

        public async Task UpdateSettingsAsync(StoreSettings setting)
        {
            _context.StoreSettings.Update(setting);
            await _context.SaveChangesAsync();
        }
    }
}
