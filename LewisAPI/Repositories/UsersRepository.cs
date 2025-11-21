using AutoMapper;
using FluentValidation.Results;
using Hangfire.PostgreSql.Properties;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace LewisAPI.Repositories
{
    public class UsersRepository : IUsersRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public UsersRepository(ApplicationDbContext context, IMemoryCache cache, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _cache = cache;
        }

        private const string AllUsersCacheKey = "AllUsersData";

        public void ClearUserCache()
        {
            _cache.Remove(AllUsersCacheKey);
        }

        public async Task<(IEnumerable<UserManagementDto> Users, int TotalCount)> GetAllUsersAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var skip = (page - 1) * limit;

            if (_cache.TryGetValue(AllUsersCacheKey, out List<ApplicationUser>? allUsers))
            {
                var totalCount = allUsers!.Count;
                var pagedUsers = allUsers.Skip(skip).Take(limit).ToList();
                var pagedDtos = _mapper.Map<IEnumerable<UserManagementDto>>(pagedUsers);

                return (pagedDtos, totalCount);
            }

            var query = _context.Users.AsNoTracking().OrderBy(x => x.Name);

            allUsers = await query.ToListAsync();

            var totalCountDb = allUsers.Count;

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5));

            _cache.Set(AllUsersCacheKey, allUsers, cacheEntryOptions);

            var pagedUserDb = allUsers.Skip(skip).Take(limit).ToList();

            var pagedDtosDb = _mapper.Map<IEnumerable<UserManagementDto>>(pagedUserDb);

            return (pagedDtosDb, totalCountDb);
        }

        public async Task BanUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);


            if (!user.LockoutEnabled)
            {
                await _userManager.SetLockoutEnabledAsync(user, true);
            }

            // 2. Set the lockout date to the maximum possible value (permanent ban)
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            ClearUserCache();
        }

        public async Task UnBanUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return;
            }

            await _userManager.SetLockoutEndDateAsync(user, null);
            await _userManager.ResetAccessFailedCountAsync(user);

            await _context.SaveChangesAsync();

            ClearUserCache();
            
        }
    }
}
