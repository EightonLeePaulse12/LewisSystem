using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using LewisAPI.Repositories;
using LewisAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using System.Text.Json;

namespace LewisAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize(Roles = "Customer")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderService;
        private readonly IPaymentService _paymentService;
        private readonly InstallmentService _installmentService;
        private readonly IConfiguration _config;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuditLogRepository _auditRepo;
        private readonly ILogger<OrdersController> _logger;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly IOrderRepository _orderRepo;
        private readonly ApplicationDbContext _context;

        public OrdersController(
            IOrderRepository orderService,
            IPaymentService paymentService,
            InstallmentService installmentService,
            IConfiguration config,
            UserManager<ApplicationUser> userManager,
            ILogger<OrdersController> logger,
            IMapper mapper,
            IMemoryCache cache,
            IAuditLogRepository auditRepo,
            ApplicationDbContext context,
            IOrderRepository orderRepo
        )
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _installmentService = installmentService;
            _config = config;
            _userManager = userManager;
            _logger = logger;
            _mapper = mapper;
            _cache = cache;
            _auditRepo = auditRepo;
            _context = context;
            _orderRepo = orderRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] Guid? userId = null
        )
        {
            string cacheKey = $"orders_{page}_{limit}_{userId?.ToString() ?? "all"}";
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

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            try
            {
                // Validate input
                if (dto == null)
                    return BadRequest(new { success = false, message = "Checkout data is required." });

                if (dto.Items == null || !dto.Items.Any())
                    return BadRequest(new { success = false, message = "No items provided." });

                if (dto.TermMonths.HasValue && (dto.TermMonths < 1 || dto.TermMonths > 36))
                    return BadRequest(new { success = false, message = "Invalid term (must be 1-36 months)." });

                if (dto.PaymentType == PaymentType.Credit && !dto.TermMonths.HasValue)
                    return BadRequest(new { success = false, message = "Term months required for credit payment." });

                if (dto.BillingAddress == null || string.IsNullOrEmpty(dto.BillingAddress.FullName) ||
                    string.IsNullOrEmpty(dto.BillingAddress.AddressLine1) ||
                    string.IsNullOrEmpty(dto.BillingAddress.City) ||
                    string.IsNullOrEmpty(dto.BillingAddress.PostalCode))
                    return BadRequest(new { success = false, message = "Complete billing address is required." });

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // Update customer billing info
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerId == userId);
                if (customer != null)
                {
                    customer.Address = dto.BillingAddress.AddressLine1;
                    customer.City = dto.BillingAddress.City;
                    customer.PostalCode = dto.BillingAddress.PostalCode;
                    _context.Update(customer);
                    await _context.SaveChangesAsync();
                }

                // Calculate totals
                decimal subtotal = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
                decimal deliveryFee = _config.GetValue<decimal>($"StoreSettings:DeliveryOptions:{dto.DeliveryOption}", 0);
                decimal taxRate = _config.GetValue<decimal>("StoreSettings:TaxRate", 0.15m);
                decimal tax = subtotal * taxRate;

                // Create order
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

                // Add order items
                order.OrderItems = dto.Items
                    .Select(i => new OrderItem
                    {
                        OrderItemId = Guid.NewGuid(),
                        OrderId = order.OrderId,
                        ProductId = i.ProductId,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        LineTotal = i.Quantity * i.UnitPrice,
                    })
                    .ToList();

                // Create delivery
                order.Delivery = new Delivery
                {
                    DeliveryId = Guid.NewGuid(),
                    OrderId = order.OrderId,
                    Courier = "",
                    TrackingNumber = "",
                    Fee = deliveryFee,
                    EstimatedDeliveryDate = null,
                    Status = DeliveryStatus.Pending,
                };

                // Handle credit payment with installments
                if (dto.PaymentType == PaymentType.Credit)
                {
                    decimal interestRate = _config.GetValue<decimal>("StoreSettings:CreditInterestRate", 0.24m);
                    decimal setupFee = _config.GetValue<decimal>("StoreSettings:CreditSetupFee", 0m);
                    decimal principal = order.Total + setupFee;

                    var agreement = new CreditAgreement
                    {
                        AgreementId = Guid.NewGuid(),
                        OrderId = order.OrderId,
                        Principal = principal,
                        InterestRate = interestRate,
                        TermMonths = dto.TermMonths.Value,
                        StartDate = DateTime.UtcNow,
                        NextDueDate = DateTime.UtcNow.AddMonths(1),
                        OutstandingBalance = principal,
                        Status = CreditAgreementStatus.Active,
                        PlanType = CreditPlanType.Amortized,
                    };

                    try
                    {
                        // Generate installment schedule
                        var installments = await _paymentService.GenerateInstallmentScheduleAsync(
                            agreement,
                            deposit: 0,
                            userId: userId
                        );

                        agreement.Installments = installments;
                        order.CreditAgreement = agreement;
                        order.Total = principal;
                    }
                    catch (ArgumentException ex)
                    {
                        _logger.LogWarning("Invalid credit terms: {ErrorMessage}", ex.Message);
                        return BadRequest(new { success = false, message = $"Invalid credit terms: {ex.Message}" });
                    }
                }

                // Save order
                await _orderService.CreateAsync(order);

                // Create audit log
                var auditLog = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = userId != Guid.Empty ? userId : null,
                    Action = "Create Order",
                    EntityType = "Order",
                    EntityId = order.OrderId.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = $"Order created with PaymentType: {dto.PaymentType}, Total: {order.Total}",
                };
                await _auditRepo.LogAsync(auditLog);

                // Invalidate cache
                _cache.Remove($"user_orders_{userId}_*");

                // Map to DTO using AutoMapper
                var orderDto = _mapper.Map<OrderDto>(order);

                return Ok(new { success = true, message = "Order created successfully.", data = orderDto });
            }
            catch (Exception ex)
            {
                _logger.LogError("Checkout error: {ErrorMessage} | StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                return StatusCode(500, new { success = false, message = "An error occurred during checkout.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { success = false, message = "Invalid order ID." });

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _orderService.GetByIdAsync(id);

                if (order == null || order.CustomerId != userId)
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

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { success = false, message = "Invalid order ID." });

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _orderService.GetByIdAsync(id);

                if (order == null || order.CustomerId != userId)
                    return NotFound(new { success = false, message = "Order not found." });

                if (order.Status != OrderStatus.Pending)
                    return BadRequest(new { success = false, message = "Only pending orders can be cancelled." });

                // Update order status
                order.Status = OrderStatus.Cancelled;
                await _orderService.UpdateAsync(order);

                // Restore stock for each item
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.StockQty += item.Quantity;
                        _context.Products.Update(product);
                    }
                }
                await _context.SaveChangesAsync();

                // Create audit log
                var auditLog = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = userId != Guid.Empty ? userId : null,
                    Action = "Cancel Order",
                    EntityType = "Order",
                    EntityId = id.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = "Order status changed to Cancelled",
                };
                await _auditRepo.LogAsync(auditLog);

                // Invalidate caches
                _cache.Remove($"user_orders_{userId}_*");
                _cache.Remove("dashboard");
                _cache.Remove("orders_*");
                _cache.Remove("inventory_*");

                return Ok(new { success = true, message = "Order cancelled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error cancelling order: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred while cancelling the order.", error = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderRequestDto request)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { success = false, message = "Invalid order ID." });

                if (request == null)
                    return BadRequest(new { success = false, message = "Update request is required." });

                var orderToUpdate = await _context.Orders
                    .Include(o => o.Delivery)
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (orderToUpdate == null)
                    return NotFound(new { success = false, message = "Order not found." });

                // Update order status if provided
                if (request.Status.HasValue)
                {
                    orderToUpdate.Status = request.Status.Value;
                }

                // Update delivery information if provided
                if (orderToUpdate.Delivery != null)
                {
                    if (!string.IsNullOrEmpty(request.Courier))
                    {
                        orderToUpdate.Delivery.Courier = request.Courier;
                    }

                    if (!string.IsNullOrEmpty(request.TrackingNumber))
                    {
                        orderToUpdate.Delivery.TrackingNumber = request.TrackingNumber;
                    }

                    if (request.DeliveryStatus != default(DeliveryStatus))
                    {
                        orderToUpdate.Delivery.Status = request.DeliveryStatus;
                    }
                }

                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString))
                    return Unauthorized();

                // Create audit log
                var userId = Guid.Parse(userIdString);
                _context.AuditLogs.Add(new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = userId != Guid.Empty ? userId : null,
                    Action = "Update Order",
                    EntityType = "Order",
                    EntityId = id.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = JsonSerializer.Serialize(request)
                });

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Order updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error updating order: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the order.", error = ex.Message });
            }
        }
    }
}