using System.Globalization;
using AutoMapper;
using CsvHelper;
using CsvHelper.Configuration;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using LewisAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace LewisAPI.Controllers
{
    [Route("api/manage")]
    [ApiController]
    [Authorize(Policy = "ManagerOrAdmin")]
    public class ManageController : ControllerBase
    {
        private readonly IProductRepository _productRepo;
        private readonly InventoryTransactionRepository _inventoryTransactionRepo;
        private readonly IAuditLogRepository _auditRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IReportService _reportService;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<ManageController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        public ManageController(
            IProductRepository productRepo,
            InventoryTransactionRepository inventoryTransactionRepo,
            IAuditLogRepository auditRepo,
            IOrderRepository orderRepo,
            IReportService reportService,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            ILogger<ManageController> logger,
            ApplicationDbContext context,
            IMemoryCache cache
        )
        {
            _productRepo = productRepo;
            _inventoryTransactionRepo = inventoryTransactionRepo;
            _auditRepo = auditRepo;
            _orderRepo = orderRepo;
            _reportService = reportService;
            _mapper = mapper;
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _cache = cache;
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? filter = null
        )
        {
            string cacheKey = $"inventory_{page}_{limit}_{filter ?? "none"}";
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<ProductDto>? dtos))
            {
                try
                {
                    var products = await _productRepo.GetAllAsync(page, limit, filter);
                    dtos = _mapper.Map<IEnumerable<ProductDto>>(products);
                    _cache.Set(cacheKey, dtos, TimeSpan.FromMinutes(5));
                }
                catch (Exception ex)
                {
                    _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                    return StatusCode(500, "An error occurred while fetching inventory.");
                }
            }
            return Ok(dtos);
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var product = _mapper.Map<Product>(dto);
                product.ProductId = Guid.NewGuid();
                var created = await _productRepo.CreateAsync(product);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(
                    created.ProductId,
                    InventoryTransactionType.Creation,
                    created.StockQty,
                    user?.Id
                );

                // Invalidate cache for inventory
                _cache.Remove("inventory_*"); // Simple wildcard invalidation; in practice, use CacheTag or remove specific keys

                return CreatedAtAction(
                    nameof(product), // Assuming exists
                    new { id = created.ProductId },
                    _mapper.Map<ProductDto>(created)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while creating the product.");
            }
        }

        [HttpPatch("products/{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existing = await _productRepo.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                int qtyChange = dto.StockQty > 0 ? dto.StockQty - existing.StockQty : 0;
                _mapper.Map(dto, existing);
                await _productRepo.UpdateAsync(existing);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, InventoryTransactionType.Update, qtyChange, user?.Id);

                // Invalidate cache
                _cache.Remove("inventory_*");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while updating the product.");
            }
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            try
            {
                var existing = await _productRepo.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                await _productRepo.SoftDeleteAsync(id);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(
                    id,
                    InventoryTransactionType.Deletion,
                    -existing.StockQty,
                    user?.Id
                );

                // Invalidate cache
                _cache.Remove("inventory_*");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while deleting the product.");
            }
        }

        [HttpPost("products/import")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream);
                using var csv = new CsvReader(
                    reader,
                    new CsvConfiguration(CultureInfo.InvariantCulture) { HasHeaderRecord = true }
                );

                var products = csv.GetRecords<CreateProductDto>().ToList();
                var entities = _mapper.Map<IEnumerable<Product>>(products);
                await _productRepo.ImportBatchAsync(entities);

                var user = await _userManager.GetUserAsync(User);
                var totalQty = entities.Sum(p => p.StockQty);
                await LogInventoryChange(
                    Guid.Empty,
                    InventoryTransactionType.Import,
                    totalQty,
                    user?.Id
                );

                // Invalidate cache
                _cache.Remove("inventory_*");

                return Ok($"Imported {products.Count} products.");
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred during import.");
            }
        }

        [HttpGet("products/export")]
        public async Task<IActionResult> ExportProducts()
        {
            try
            {
                var products = await _productRepo.ExportBatchAsync();
                var dtos = _mapper.Map<IEnumerable<ProductDto>>(products);

                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                await csv.WriteRecordsAsync(dtos);
                await writer.FlushAsync();
                memoryStream.Position = 0;

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(Guid.Empty, InventoryTransactionType.Export, 0, user?.Id);

                return File(memoryStream.ToArray(), "text/csv", "products.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred during export.");
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            string cacheKey = "dashboard";
            if (!_cache.TryGetValue(cacheKey, out object? dashboardData))
            {
                try
                {
                    var lowStock = await _context
                        .Products.Where(p => p.StockQty < p.ReorderThreshold && !p.IsDeleted)
                        .ToListAsync();

                    var sales = await _context
                        .Orders.GroupBy(o => o.PaymentType)
                        .Select(g => new { PaymentType = g.Key, Total = g.Sum(o => o.Total) })
                        .ToListAsync();

                    var outstanding = await _context.CreditAgreements.SumAsync(ca =>
                        ca.OutstandingBalance
                    );

                    var recent = await _context
                        .Orders.OrderByDescending(o => o.OrderDate)
                        .Take(10)
                        .ToListAsync();

                    dashboardData = new
                    {
                        LowStock = lowStock,
                        Sales = sales,
                        Outstanding = outstanding,
                        RecentOrders = recent,
                    };
                    _cache.Set(cacheKey, dashboardData, TimeSpan.FromMinutes(5));
                }
                catch (Exception ex)
                {
                    _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                    return StatusCode(500, "An error occurred while fetching dashboard data.");
                }
            }
            return Ok(dashboardData);
        }

        [HttpGet("reports/sales")]
        public async Task<IActionResult> GetSalesReport(
            [FromQuery] DateTime? start = null,
            [FromQuery] DateTime? end = null,
            [FromQuery] string format = "csv"
        )
        {
            start ??= DateTime.UtcNow.AddMonths(-1);
            end ??= DateTime.UtcNow;
            try
            {
                var report = await _reportService.GenerateSalesReportAsync(
                    start.Value,
                    end.Value,
                    format
                );
                return File(
                    report,
                    format == "csv" ? "text/csv" : "application/pdf",
                    $"sales.{format}"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while generating sales report.");
            }
        }

        [HttpGet("reports/payments")]
        public async Task<IActionResult> GetPaymentsReport(
            [FromBody] DateTime? start = null,
            [FromBody] DateTime? end = null,
            [FromQuery] string format = "csv"
        )
        {
            start ??= DateTime.UtcNow.AddMonths(-1);
            end ??= DateTime.UtcNow;
            try
            {
                var report = await _reportService.GeneratePaymentsReportAsync(
                    start.Value,
                    end.Value,
                    format
                );
                return File(
                    report,
                    format == "csv" ? "text/csv" : "application/pdf",
                    $"payments.{format}"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while generating payments report.");
            }
        }

        [HttpGet("reports/overdue")]
        public async Task<IActionResult> GetOverdueReport([FromQuery] string format = "csv")
        {
            try
            {
                var report = await _reportService.GenerateOverdueReportAsync(format);
                return File(
                    report,
                    format == "csv" ? "text/csv" : "application/pdf",
                    $"overdue.{format}"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while generating overdue report.");
            }
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromBody] Guid userId = default
        )
        {
            string cacheKey = $"orders_{page}_{limit}";
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Order>? orders))
            {
                try
                {
                    orders = await _orderRepo.GetAllAsync(page, limit, userId);
                    _cache.Set(cacheKey, orders, TimeSpan.FromMinutes(5));
                }
                catch (Exception ex)
                {
                    _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                    return StatusCode(500, "An error occurred while fetching orders.");
                }
            }
            return Ok(orders);
        }

        [HttpPatch("orders/{id}")]
        public async Task<IActionResult> UpdateOrderStatus(
            Guid id,
            [FromBody] UpdateOrderStatusDto dto
        )
        {
            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                    return NotFound();

                var oldStatus = order.Status;
                order.Status = dto.NewStatus;
                await _orderRepo.UpdateAsync(order);

                var user = await _userManager.GetUserAsync(User);
                var audit = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = user?.Id ?? Guid.Empty,
                    Action = "Update Order Status",
                    EntityType = "Order",
                    EntityId = id.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = $"Status changed from {oldStatus} to {dto.NewStatus}",
                };
                await _auditRepo.LogAsync(audit);

                // Invalidate order caches
                _cache.Remove("orders_*");
                _cache.Remove("dashboard");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while updating order status.");
            }
        }

        private async Task LogInventoryChange(
            Guid productId,
            InventoryTransactionType type,
            int changeQty,
            Guid? userId
        )
        {
            var performedBy = userId ?? Guid.Empty;

            var transaction = new InventoryTransaction
            {
                TransactionId = Guid.NewGuid(),
                ProductId = productId,
                ChangeQty = changeQty,
                Type = type,
                Note = $"Action: {type}",
                PerformedBy = performedBy,
                PerformedAt = DateTime.UtcNow,
            };
            await _inventoryTransactionRepo.AddAsync(transaction);

            var audit = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = performedBy,
                Action = type.ToString(),
                EntityType = "Product",
                EntityId = productId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"ChangeQty: {changeQty}",
            };
            await _auditRepo.LogAsync(audit);
        }
    }
}
