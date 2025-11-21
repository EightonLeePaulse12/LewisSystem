using System;
using System.Text;
using System.Threading.Tasks;
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
using System.Globalization;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;

namespace LewisAPI.Controllers
{
    [Route("api/manage")]
    [ApiController]
    [Authorize]
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
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IUsersRepository _usersRepo;

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
            IMemoryCache cache,
            IHttpClientFactory httpClientFactory,
            IUsersRepository usersRepo
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
            _httpClientFactory = httpClientFactory;
            _usersRepo = usersRepo;
        }

        private const string InventoryVersionKey = "inventory_version";

        private const int MAX_FILE_SIZE = 500 * 1024;

        private void BumpInventoryVersion()
        {
            _cache.Set(InventoryVersionKey, Guid.NewGuid());
        }


        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? filter = null
        )
        {
            // 1️⃣ Get current inventory cache version  
            var version = _cache.GetOrCreate(InventoryVersionKey, e => Guid.NewGuid());

            // 2️⃣ Build final cache key  
            string cacheKey = $"inventory_{version}_{page}_{limit}_{filter ?? "none"}";

            // 3️⃣ Try get cached results  
            if (_cache.TryGetValue(cacheKey, out IEnumerable<ProductListDto>? dtos))
                return Ok(dtos);

            // 4️⃣ Not in cache → fetch from database  
            try
            {
                var products = await _productRepo.GetAllAsync(page, limit, filter);
                dtos = _mapper.Map<IEnumerable<ProductListDto>>(products);

                // 5️⃣ Store into cache  
                _cache.Set(cacheKey, dtos, TimeSpan.FromMinutes(5));

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while fetching inventory.");
            }
        }


        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = _mapper.Map<Product>(dto);

            if (dto.ImageUrl != null)
            {
                if (dto.ImageUrl.Length > MAX_FILE_SIZE)
                {
                    return BadRequest($"Image file size exceeds the limit of {MAX_FILE_SIZE / 1024} KB.");
                }
                product.ImageUrl = await FileToByteArray(dto.ImageUrl);
            }

            

            try
            {
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
                BumpInventoryVersion();

                return CreatedAtAction(
                    nameof(GetProductById), // Assuming exists
                    new { id = created.ProductId },
                    _mapper.Map<ProductListDto>(created)
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

                int qtyChange = dto.StockQty.HasValue && dto.StockQty.Value != existing.StockQty
                    ? dto.StockQty.Value - existing.StockQty
                    : 0;

                // Map only provided fields (AutoMapper handles nulls)
                _mapper.Map(dto, existing);

                // If you added string? Image1 for base64 in UpdateProductDto (optional):
                // if (!string.IsNullOrEmpty(dto.Image1))
                // {
                //     try { existing.ImageUrl = Convert.FromBase64String(dto.Image1); }
                //     catch { return BadRequest("Invalid base64 for image."); }
                // }
                // But prefer the separate images endpoint—ignore base64 here for simplicity.

                await _productRepo.UpdateAsync(existing);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, InventoryTransactionType.Update, qtyChange, user?.Id);

                BumpInventoryVersion();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while updating the product.");
            }
        }

        [HttpPatch("products/{id}/images")]
        public async Task<IActionResult> UpdateProductImages(
            Guid id,
            IFormFile? imageUrl
        )
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            if (imageUrl != null)
            {
                // ✨ ADDED: File size validation
                if (imageUrl.Length > MAX_FILE_SIZE)
                {
                    return BadRequest($"Image file size exceeds the limit of {MAX_FILE_SIZE / 1024} KB.");
                }

                product.ImageUrl = await FileToByteArray(imageUrl);
            }

            try
            {
                await _productRepo.UpdateAsync(product);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, InventoryTransactionType.Update, 0, user?.Id);

                BumpInventoryVersion();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    "Unexpected error occured while updating images: {ErrorMessage}",
                    ex.Message
                );
                return StatusCode(500, "Unexpected error occured while updating images");
            }
        }

        [HttpDelete("products/{id}")]
        [Authorize(Roles = "Manager, Admin")]
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
                BumpInventoryVersion();

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
                using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    HeaderValidated = null, // Optional: Prevents errors if CSV headers case doesn't match exactly
                    MissingFieldFound = null
                });

                // 1. Read data using the IMPORT DTO (which uses strings for images)
                var importDtos = csv.GetRecords<ProductImportDto>().ToList();
                _logger.LogInformation("Read {Count} records from CSV", importDtos.Count);

                // 2. Process images asynchronously (base64 or URL to byte[])
                var entitiesList = _mapper.Map<List<Product>>(importDtos);
                _logger.LogInformation("Mapped {Count} entities", entitiesList.Count);

                for (int i = 0; i < entitiesList.Count; i++)
                {
                    var dto = importDtos[i];
                    _logger.LogInformation("Processing images for SKU: {SKU}", dto.SKU);

                    entitiesList[i].ImageUrl = await GetImageBytesAsync(dto.ImageUrl);
                }

                // 3. Save to database
                await _productRepo.ImportBatchAsync(entitiesList);

                // 4. Log inventory changes
                var user = await _userManager.GetUserAsync(User);
                var totalQty = entitiesList.Sum(p => p.StockQty);
                await LogInventoryChange(null, InventoryTransactionType.Import, totalQty, user?.Id);

                BumpInventoryVersion();

                return Ok($"Imported {importDtos.Count} products.");
            }
            catch (CsvHelperException csvEx)
            {
                // Returns specific CSV formatting errors to the user
                return BadRequest($"CSV Error at Row {csvEx.Context.Parser.Row}: {csvEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during import.");
                return StatusCode(500, "An error occurred during import.");
            }
        }

        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _productRepo.GetByIdAsync(id);

            return product == null
                ? NotFound()
                : Ok(_mapper.Map<ProductListDto>(product));
        }

        [HttpGet("products/export")]
        public async Task<IActionResult> ExportProducts()
        {
            try
            {
                var products = await _productRepo.ExportBatchAsync();
                var dtos = _mapper.Map<IEnumerable<ProductListDto>>(products);

                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                await csv.WriteRecordsAsync(dtos);
                await writer.FlushAsync();
                memoryStream.Position = 0;

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(null, InventoryTransactionType.Export, 0, user?.Id);

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
                        .Products.Where(p => p.StockQty < 10 && !p.IsDeleted)
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
                        .Take(4)
                        .ToListAsync();

                    var totalRevenue = await _context.Orders.SumAsync(o => o.Total);

                    var totalOrders = await _context.Orders.CountAsync();

                    var productsInStock = await _context.Products
                        .Where(p => p.StockQty > 0 && !p.IsDeleted)
                        .CountAsync();

                    var lowestStock = await _context.Products
                        .Where(p => !p.IsDeleted)
                        .OrderBy(p => p.StockQty)
                        .Take(4)
                        .ToListAsync();

                    var todaysOrdersCount = await _context.Orders
                        .Where(o => o.OrderDate.Date == DateTime.UtcNow.Date)
                        .CountAsync();

                    var pendingOrdersCount = await _context.Orders
                        .Where(o => o.Status == OrderStatus.Pending)
                        .CountAsync();

                    var avgOrderValue = await _context.Orders
                        .AverageAsync(o => o.Total);

                    var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
                    var revenueTrend = await _context.Orders
                        .Where(o => o.OrderDate >= sixMonthsAgo)
                        .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                        .OrderBy(g => g.Key.Year)
                        .ThenBy(g => g.Key.Month)
                        .Select(g => new
                        {
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                            Revenue = g.Sum(o => o.Total)
                        })
                        .ToListAsync();

                    var orderStatusDistribution = await _context.Orders
                        .GroupBy(o => o.Status)
                        .Select(g => new { Status = g.Key, Count = g.Count() })
                        .ToListAsync();

                    var OrderTrend = await _context.Orders
                        .Where(o => o.OrderDate >= sixMonthsAgo)
                        .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                        .OrderBy(g => g.Key.Year)
                        .ThenBy(g => g.Key.Month)
                        .Select(g => new
                        {
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                            Count = g.Count()
                        })
                        .ToListAsync();

                    var Recent = await _context
                        .Orders
                        .Include(o => o.Customer)
                        .ThenInclude(c => c.User)
                        .OrderByDescending(o => o.OrderDate)
                        .Take(4)
                        .ToListAsync();

                    var topCategoriesBySales = await _context.OrderItems
                        .Include(oi => oi.Product)
                        .ThenInclude(p => p.Category)
                        .Where(oi => oi.Product != null && oi.Product.Category != null && !oi.Product.IsDeleted)
                        .GroupBy(oi => oi.Product.Category.Name)
                        .Select(g => new { Category = g.Key, Sales = g.Sum(oi => oi.LineTotal) })
                        .OrderByDescending(g => g.Sales)
                        .ToListAsync();

                    dashboardData = new
                    {
                        LowStock = lowStock,
                        Sales = sales,
                        Outstanding = outstanding,
                        RecentOrders = Recent,
                        Recent = recent,
                        TotalRevenue = totalRevenue,
                        TotalOrders = totalOrders,
                        orderTrend = OrderTrend,
                        ProductsInStock = productsInStock,
                        LowestStock = lowestStock,
                        TodaysOrdersCount = todaysOrdersCount,
                        PendingOrdersCount = pendingOrdersCount,
                        AvgOrderValue = avgOrderValue,
                        RevenueTrend = revenueTrend,
                        OrderStatusDistribution = orderStatusDistribution,
                        TopCategoriesBySales = topCategoriesBySales
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
            [FromQuery] DateTime? start = null,
            [FromQuery] DateTime? end = null,
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
            [FromQuery] Guid? userId = default

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

        [HttpGet("orders/single/{id}")]
        public async Task<IActionResult> GetOrderDetails(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { success = false, message = "Invalid order ID." });

                var order = await _orderRepo.GetByIdAsync(id);

                if (order == null)
                    return NotFound(new { success = false, message = "Order not found." });

                var orderDto = _mapper.Map<OrderDto>(order);
                return Ok(new { success = true, data = orderDto });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching order details: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred while fetching order details.", error = ex.Message });
            }
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
                BumpInventoryVersion();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while updating order status.");
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("products/{id}/permanent")]
        public async Task<IActionResult> PermanentDeleteProduct(Guid id)
        {
            try
            {
                await _productRepo.HardDeleteAsync(id);
                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(
                    id,
                    InventoryTransactionType.PermanentDeletion,
                    0,
                    user?.Id
                );

                BumpInventoryVersion();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occured while permanently deleting the product");
            }
        }

        [HttpGet("users")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllUsersAsync([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                _logger.LogInformation("Fetching users: Page {Page}, Limit {Limit}", page, limit);

                var (users, totalCount) = await _usersRepo.GetAllUsersAsync(page, limit);

                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Limit", limit.ToString());

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex, "Error fetching all users");
                return StatusCode(500, "Internal server error while fetching users");
            }
        }

        [HttpPost("ban/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BanUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Invalid user ID.");
            }

            try
            {
                await _usersRepo.BanUserAsync(id);

                _logger.LogWarning("User {UserId} has been banned.", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning user {UserId}", id);
                return StatusCode(500, "Internal server error while banning user");
            }
        }

        [HttpPost("unban/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnBanUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("Invalid User ID");
            }

            try
            {
                await _usersRepo.UnBanUserAsync(id);
                _logger.LogInformation("User has been unbanned {userid}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning user {userId}", id);
                return StatusCode(500, ex.Message);
            }
        }

        private async Task LogInventoryChange(
            Guid? productId,
            InventoryTransactionType type,
            int changeQty,
            Guid? userId
        )
        {
            var performedBy = userId ?? Guid.Empty;

            if (productId.HasValue)
            {
                var transaction = new InventoryTransaction
                {
                    TransactionId = Guid.NewGuid(),
                    ProductId = productId.Value,
                    ChangeQty = changeQty,
                    Type = type,
                    Note = $"Action: {type}",
                    PerformedBy = performedBy,
                    PerformedAt = DateTime.UtcNow,
                };
                await _inventoryTransactionRepo.AddAsync(transaction);
            }

            var audit = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = performedBy,
                Action = type.ToString(),
                EntityType = "Product",
                EntityId = productId?.ToString() ?? "Batch",
                Timestamp = DateTime.UtcNow,
                Details = $"ChangeQty: {changeQty}",
            };
            await _auditRepo.LogAsync(audit);
        }

        private async Task<byte[]> GetImageBytesAsync(string urlOrPath)
        {
            if (string.IsNullOrEmpty(urlOrPath)) return null;

            // If it's a web URL, download it to save as binary
            if (urlOrPath.StartsWith("http"))
            {
                using var client = _httpClientFactory.CreateClient();
                return await client.GetByteArrayAsync(urlOrPath);
            }

            // If it's a local file path (Server side import)
            if (System.IO.File.Exists(urlOrPath))
            {
                return await System.IO.File.ReadAllBytesAsync(urlOrPath);
            }

            return null;
        }

        //[HttpGet("products/{id}")]
        //public async Task<IActionResult> GetProductById(Guid id)
        //{
        //    var product = await _productRepo.GetByIdAsync(id);
        //    if (product == null)
        //        return NotFound();

        //    var dto = _mapper.Map<ProductDto>(product);
        //    return Ok(dto);
        //}


        private async Task<byte[]> FileToByteArray(IFormFile file)
        {
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}