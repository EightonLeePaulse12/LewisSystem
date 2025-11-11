using System.Security.Claims;
using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using LewisAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace LewisAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize(Roles = "Customer")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _config;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AuditLogRepository _auditRepo;
        private readonly ILogger<OrdersController> _logger;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _context;

        public OrdersController(
            IOrderRepository orderService,
            IPaymentService paymentService,
            IConfiguration config,
            UserManager<ApplicationUser> userManager,
            ILogger<OrdersController> logger,
            IMapper mapper,
            IMemoryCache cache,
            AuditLogRepository auditRepo,
            ApplicationDbContext context
        )
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _config = config;
            _userManager = userManager;
            _logger = logger;
            _mapper = mapper;
            _cache = cache;
            _auditRepo = auditRepo;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10
        )
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string cacheKey = $"user_orders_{userId}_{page}_{limit}";
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Order>? orders))
            {
                try
                {
                    orders = await _orderService.GetAllAsync(page, limit, userId);
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

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            if (dto.TermMonths.HasValue && (dto.TermMonths < 1 || dto.TermMonths > 36))
                return BadRequest("Invalid term (must be 1-36 months).");

            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                if (dto.Items == null || !dto.Items.Any())
                    return BadRequest("No items provided.");

                decimal subtotal = dto.Items.Sum(i => i.Quantity * i.UnitPrice);

                decimal deliveryFee = _config.GetValue<decimal>(
                    $"StoreSettings:DeliveryOptions:{dto.DeliveryOption}",
                    0
                );

                decimal tax = subtotal * _config.GetValue<decimal>("StoreSettings:TaxRate", 0.15m);

                var order = new Order
                {
                    OrderId = Guid.NewGuid(),
                    CustomerId = userId,
                    OrderDate = DateTime.UtcNow,
                    SubTotal = subtotal,
                    DeliveryFee = deliveryFee,
                    Tax = tax,
                    Total = subtotal + deliveryFee + tax,
                    PaymentType = dto.PaymentType,
                    Status = OrderStatus.Pending,
                };

                order.OrderItems = dto
                    .Items.Select(i => new OrderItem
                    {
                        OrderItemId = Guid.NewGuid(),
                        OrderId = order.OrderId,
                        ProductId = i.ProductId,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        LineTotal = i.Quantity * i.UnitPrice,
                    })
                    .ToList();

                // ... rest same, no cart clearing

                await _orderService.CreateAsync(order);

                // Invalidate caches
                _cache.Remove($"user_orders_{userId}_*");

                return Ok(_mapper.Map<OrderDto>(order));
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred during checkout.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _orderService.GetByIdAsync(id);
                if (order == null || order.CustomerId != userId)
                    return NotFound();

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while fetching order details.");
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _orderService.GetByIdAsync(id);
                if (order == null || order.CustomerId != userId)
                    return NotFound();

                if (order.Status != OrderStatus.Pending)
                    return BadRequest("Order cannot be cancelled.");

                order.Status = OrderStatus.Cancelled;
                await _orderService.UpdateAsync(order);

                // Restore stock
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.StockQty += item.Quantity;
                    }
                }
                await _context.SaveChangesAsync();

                // Audit
                var auditLog = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = userId,
                    Action = "Cancel Order",
                    EntityType = "Order",
                    EntityId = id.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = $"Order status changed to Cancelled",
                };

                await _auditRepo.LogAsync(auditLog);

                // Invalidate caches
                _cache.Remove($"user_orders_{userId}_*");
                _cache.Remove("dashboard");
                _cache.Remove("orders_*");
                _cache.Remove("inventory_*"); // Since stock changed

                return Ok("Order cancelled.");
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while cancelling the order.");
            }
        }
    }
}
