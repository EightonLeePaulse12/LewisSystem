using LewisAPI.DTOs;
using LewisAPI.Models;

namespace LewisAPI.Interfaces
{
    public interface IUsersRepository
    {
        Task<(IEnumerable<UserManagementDto> Users, int TotalCount)> GetAllUsersAsync(int page, int limit);
        Task BanUserAsync(Guid id);
        Task UnBanUserAsync(Guid id);
        void ClearUserCache();
    }
}
