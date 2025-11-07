using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;

namespace LewisAPI.Repositories
{
    public class InventoryTransactionRepository : IInventoryTransaction
    {
        private readonly ApplicationDbContext _context;

        public InventoryTransactionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(InventoryTransaction transaction)
        {
            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();
        }
    }
}
