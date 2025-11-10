using System.Text.Json;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LewisAPI.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly InventoryTransactionRepository _inventoryTransactionRepo;
        private readonly AuditLogRepository _auditLogRepo;

        public OrderRepository(
            ApplicationDbContext context,
            InventoryTransactionRepository inventoryTransactionRepo,
            AuditLogRepository auditLogRepo
        )
        {
            _context = context;
            _inventoryTransactionRepo = inventoryTransactionRepo;
            _auditLogRepo = auditLogRepo;
        }

        public async Task<IEnumerable<Order>> GetAllAsync(int page, int limit, Guid userId)
        {
            var query = _context
                .Orders.Include(o => o.OrderItems)
                .Where(o => o.CustomerId == userId)
                .Include(o => o.CreditAgreement)
                .Include(o => o.Delivery)
                .Include(o => o.Payments)
                .AsQueryable();

            return await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _context
                .Orders.Include(o => o.OrderItems)
                .Include(o => o.CreditAgreement)
                .ThenInclude(ca => ca.Installments)
                .Include(o => o.Delivery)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.OrderId == id);
        }

        public async Task CreateAsync(Order order)
        {
            foreach (var item in order.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null || product.StockQty < item.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Insufficient stock for product {item.ProductId}."
                    );
                }
            }
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Decrement and log
            foreach (var item in order.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                product.StockQty -= item.Quantity;

                var transaction = new InventoryTransaction
                {
                    // Implement
                };
                await _inventoryTransactionRepo.AddAsync(transaction);
            }

            string details = JsonSerializer.Serialize(order);

            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(Guid id)
        {
            var order = await GetByIdAsync(id);
            if (order != null)
            {
                // Assume Order has IsDeleted bool; set to true
                // order.IsDeleted = true;
                // await UpdateAsync(order);
                // Or remove if no soft delete
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}
