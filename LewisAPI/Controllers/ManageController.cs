using System.Globalization;
using AutoMapper;
using CsvHelper;
using CsvHelper.Configuration;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "ManagerOrAdmin")]
    public class ManageController : ControllerBase
    {
        private readonly IProductRepository _productRepo;
        private readonly IInventoryTransaction _inventoryTransaction;
        private readonly IAuditLogRepository _auditRepo;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager; // For getting current user ID
        private readonly ILogger _logger;
        private readonly ApplicationDbContext _context;

        public ManageController(
            IProductRepository productRepo,
            IInventoryTransaction inventoryTransaction,
            ILogger logger,
            IAuditLogRepository auditRepo,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context
        )
        {
            _productRepo = productRepo;
            _auditRepo = auditRepo;
            _mapper = mapper;
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _inventoryTransaction = inventoryTransaction;
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? filter = null
        )
        {
            // Same as GetProducts, but for managers (could add more details if needed)
            try
            {
                var products = await _productRepo.GetAllAsync(page, limit, filter);
                var dtos = _mapper.Map<IEnumerable<ProductDto>>(products);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
                return StatusCode(500, "An error occurred while fetching inventory.");
            }
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var product = _mapper.Map<Product>(dto);
                product.ProductId = Guid.NewGuid(); // Generate ID
                var created = await _productRepo.CreateAsync(product);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(
                    created.ProductId,
                    "Product Creation",
                    created.StockQty,
                    user?.Id
                ); // Use initial StockQty

                return CreatedAtAction(
                    nameof(product),
                    new { id = created.ProductId },
                    _mapper.Map<ProductDto>(created)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
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

                _mapper.Map(dto, existing); // Apply partial updates
                await _productRepo.UpdateAsync(existing);

                var user = await _userManager.GetUserAsync(User);
                await LogInventoryChange(id, "Product Update", 0, user?.Id); // 0 or detect qty change if needed

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
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
                await LogInventoryChange(id, "Product Deletion", -existing.StockQty, user?.Id); // Negative for removal

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
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

                var products = csv.GetRecords<CreateProductDto>().ToList(); // Map CSV to DTO
                var entities = _mapper.Map<IEnumerable<Product>>(products);
                await _productRepo.ImportBatchAsync(entities);

                var user = await _userManager.GetUserAsync(User);
                var totalQty = entities.Sum(p => p.StockQty); // Sum initial stock for batch
                await LogInventoryChange(Guid.Empty, "Batch Import", totalQty, user?.Id);

                return Ok($"Imported {products.Count} products.");
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
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

                return File(memoryStream.ToArray(), "text/csv", "products.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occured: {ErrorMessage}", ex);
                return StatusCode(500, "An error occurred during export.");
            }
        }

        private async Task LogInventoryChange(
            Guid productId,
            string action,
            int changeQty,
            Guid? userId
        )
        {
            var performedBy = userId ?? Guid.Empty;
            // Create InventoryTransaction
            InventoryTransactionType transactionType = action switch
            {
                "Product Creation" => InventoryTransactionType.Creation,
                "Product Update" => InventoryTransactionType.Update,
                "Product Deletion" => InventoryTransactionType.Deletion,
                "Batch Import" => InventoryTransactionType.Import,
                "Export" => InventoryTransactionType.Export,
                _ => throw new ArgumentException($"Unknown action: {action}"),
            };

            var transaction = new InventoryTransaction
            {
                TransactionId = Guid.NewGuid(),
                ProductId = productId,
                ChangeQty = changeQty,
                Type = transactionType, // Now enum
                Note = $"Action: {action}",
                PerformedBy = performedBy,
                PerformedAt = DateTime.UtcNow,
            };
            await _inventoryTransaction.AddAsync(transaction);

            var audit = new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = performedBy,
                Action = action, // Assuming Action is string; map to enum if needed
                EntityType = "Product",
                EntityId = productId.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"ChangeQty: {changeQty}" // JSON if complex
            };
            await _auditRepo.LogAsync(audit);
        }
    }
}
