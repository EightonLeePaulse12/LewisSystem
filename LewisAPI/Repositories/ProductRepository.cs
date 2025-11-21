using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace LewisAPI.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private const string CacheVersionKey = "products_cache_version";
        private readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

        public ProductRepository(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<IEnumerable<Product>> GetAllAsync(
            int page,
            int limit,
            string? filter = null
        )
        {
            var version = GetCacheVersion();
            var cacheKey = $"products_{version}_page{page}_limit{limit}_filter{filter ?? "none"}";

            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Product>? cachedProducts))
            {
                var query = _context.Products
                    .Where(p => !p.IsDeleted)
                    .Include(c => c.Category) // Keep Include to load Category object
                    .AsQueryable();

                if (!string.IsNullOrEmpty(filter))
                {
                    query = query.Where(p => p.Name.Contains(filter) || p.SKU.Contains(filter) || p.Category.Name.Contains(filter));
                }

                cachedProducts = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

                _cache.Set(
                    cacheKey,
                    cachedProducts,
                    new MemoryCacheEntryOptions { SlidingExpiration = CacheExpiration }
                );
            }

            return cachedProducts ?? Enumerable.Empty<Product>();
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            var version = GetCacheVersion();
            var cacheKey = $"product_{version}_{id}";

            if (!_cache.TryGetValue(cacheKey, out Product? cachedProduct))
            {
                cachedProduct = await _context.Products.FirstOrDefaultAsync(p =>
                    p.ProductId == id && !p.IsDeleted
                );
            }

            if (cachedProduct != null)
            {
                _cache.Set(
                    cacheKey,
                    cachedProduct,
                    new MemoryCacheEntryOptions { SlidingExpiration = CacheExpiration }
                );
            }

            return cachedProduct;
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            InvalidateCache();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            InvalidateCache();
        }

        public async Task SoftDeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new Exception("Product not found");
            product.IsDeleted = true;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            InvalidateCache();
        }

        public async Task ImportBatchAsync(IEnumerable<Product> products)
        {
            await _context.Products.AddRangeAsync(products);
            await _context.SaveChangesAsync();
            InvalidateCache();
        }

        public async Task<IEnumerable<Product>> ExportBatchAsync()
        {
            var version = GetCacheVersion();
            var cacheKey = $"products_{version}_all";

            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Product>? cachedProducts))
            {
                cachedProducts = await _context.Products.Where(p => !p.IsDeleted).ToListAsync();

                _cache.Set(
                    cacheKey,
                    cachedProducts,
                    new MemoryCacheEntryOptions { SlidingExpiration = CacheExpiration }
                );
            }

            return cachedProducts ?? Enumerable.Empty<Product>();
        }

        public async Task HardDeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new Exception("Product Not Found");
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            InvalidateCache();
        }

        private string GetCacheVersion()
        {
            if (!_cache.TryGetValue(CacheVersionKey, out string? version))
            {
                version = Guid.NewGuid().ToString();
                _cache.Set(CacheVersionKey, version, CacheExpiration);
            }

            return version;
        }

        private void InvalidateCache()
        {
            _cache.Set(CacheVersionKey, Guid.NewGuid().ToString(), CacheExpiration);
        }
    }
}
