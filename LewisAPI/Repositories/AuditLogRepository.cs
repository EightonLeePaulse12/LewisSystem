using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LewisAPI.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly ApplicationDbContext _context;

        public AuditLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(AuditLog log)
        {
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAllAsync(int page, int limit, string? filter)
        {
            var query = _context.AuditLogs.OrderByDescending(l => l.Timestamp).AsQueryable();
            if (!string.IsNullOrEmpty(filter))
            {
                query = query.Where(l =>
                    l.EntityType.Contains(filter) || l.Action.Contains(filter)
                );
            }
            return await query.Skip((page - 1) * limit).Take(limit).ToListAsync();
        }
    }
}
