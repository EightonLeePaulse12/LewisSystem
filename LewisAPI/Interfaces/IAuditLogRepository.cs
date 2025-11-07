using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IAuditLogRepository
    {
        Task LogAsync(AuditLog log);
    }
}
