using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IAuditLogRepository
    {
        Task LogAsync(AuditLog log);

        Task<IEnumerable<AuditLog>> GetAllAsync(int page, int limit, string? filter);
    }
}
