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
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = _mapper.Map<Product>(dto);

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
                _cache.Remove("inventory_*"); // Simple wildcard invalidation; in practice, use CacheTag or remove specific keys
                _cache.Remove("dashboard");

                return CreatedAtAction(
                    nameof(GetInventory), // Assuming exists
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

        [HttpPost("products/{id}/images")]
        public async Task<IActionResult> UploadProductImages(
            Guid id,
            IFormFile? image1,
            IFormFile? image2,
            IFormFile? image3
        )
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            if (image1 != null)
                product.Image1 = await FileToByteArray(image1);
            if (image2 != null)
                product.Image2 = await FileToByteArray(image2);
            if (image3 != null)
                product.Image3 = await FileToByteArray(image3);

            try
            {
                await _productRepo.UpdateAsync(product);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, InventoryTransactionType.Update, 0, user?.Id);

                _cache.Remove("inventory_*");
                _cache.Remove("dashboard");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    "Unexpected error occured while uploading images: {ErrorMessage}",
                    ex.Message
                );
                return StatusCode(500, "An unexpected error occured while uploading images");
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
                _cache.Remove("dashboard");

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
            IFormFile? image1,
            IFormFile? image2,
            IFormFile? image3
        )
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            if (image1 != null)
                product.Image1 = await FileToByteArray(image1);
            if (image2 != null)
                product.Image2 = await FileToByteArray(image2);
            if (image3 != null)
                product.Image3 = await FileToByteArray(image3);

            try
            {
                await _productRepo.UpdateAsync(product);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, InventoryTransactionType.Update, 0, user?.Id);

                _cache.Remove("inventory_*");
                _cache.Remove("dashboard");

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
                _cache.Remove("dashboard");

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

                    entitiesList[i].Image1 = await GetImageBytesAsync(dto.Image1);
                    entitiesList[i].Image2 = await GetImageBytesAsync(dto.Image2);
                    entitiesList[i].Image3 = await GetImageBytesAsync(dto.Image3);
                }

                // 3. Save to database
                await _productRepo.ImportBatchAsync(entitiesList);

                // 4. Log inventory changes
                var user = await _userManager.GetUserAsync(User);
                var totalQty = entitiesList.Sum(p => p.StockQty);
                await LogInventoryChange(null, InventoryTransactionType.Import, totalQty, user?.Id);

                _cache.Remove("inventory_*");

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
                : Ok(_mapper.Map<ProductDto>(product));
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

                _cache.Remove("inventory_*");
                _cache.Remove("dashboard");

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
        [Authorize(Policy = "AdminOnly")]
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

        private async Task<byte[]?> GetImageBytesAsync(string? imageStr)
        {
            if (string.IsNullOrEmpty(imageStr)) return null;

            if (imageStr.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    using var client = _httpClientFactory.CreateClient();
                    return await client.GetByteArrayAsync(imageStr);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to download image from URL {Url}: {Message}", imageStr, ex.Message);
                    return null;
                }
            }
            else
            {
                try
                {
                    return Convert.FromBase64String(imageStr);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to decode base64 image: {Message}", ex.Message);
                    return null;
                }
            }
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
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }
    }
}