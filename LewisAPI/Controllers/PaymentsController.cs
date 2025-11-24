using System.Security.Claims;
using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace LewisAPI.Controllers
{
    [Route("api/payments")]
    [ApiController]
    [Authorize(Roles = "Customer")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<PaymentsController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly IAuditLogRepository _auditRepo;

        public PaymentsController(
            IPaymentService paymentService,
            UserManager<ApplicationUser> userManager,
            ILogger<PaymentsController> logger,
            ApplicationDbContext context,
            IMapper mapper,
            IMemoryCache cache,
            IAuditLogRepository auditRepo
        )
        {
            _paymentService = paymentService;
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _mapper = mapper;
            _cache = cache;
            _auditRepo = auditRepo;
        }

        [HttpPost]
        public async Task<IActionResult> MakePayment([FromBody] PaymentDto dto)
        {
            try
            {
                // Validate input
                if (dto == null)
                    return BadRequest(new { success = false, message = "Payment data is required." });

                if (dto.Amount <= 0)
                    return BadRequest(new { success = false, message = "Payment amount must be greater than 0." });

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var user = await _userManager.FindByIdAsync(userId.ToString());

                // Get email from DTO or user profile
                var email = dto.Email ?? user?.Email;
                if (string.IsNullOrWhiteSpace(email))
                    return BadRequest(new { success = false, message = "Email is required for payment." });

                string reference = dto.Reference ?? Guid.NewGuid().ToString();

                Dictionary<string, string> metadata = new Dictionary<string, string>
                {
                    { "userId", userId.ToString() }
                };

                if (dto.OrderId.HasValue)
                {
                    metadata.Add("orderId", dto.OrderId.Value.ToString());
                }

                if (dto.AgreementId.HasValue)
                {
                    metadata.Add("agreementId", dto.AgreementId.Value.ToString());
                }

                // Determine payment method (default to Manual if not specified)
                var paymentMethod = string.IsNullOrWhiteSpace(dto.Method) ? "Manual" : dto.Method;

                if (paymentMethod.Equals("Paystack", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        var authUrl = await _paymentService.InitiatePaymentAsync(
                            dto.Amount,
                            email,
                            reference,
                            null,
                            metadata
                        );
                        return Ok(new { success = true, authorizationUrl = authUrl, reference = reference });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Paystack initialization error: {ErrorMessage}", ex.Message);
                        return BadRequest(new { success = false, message = "Failed to initiate Paystack payment.", error = ex.Message });
                    }
                }
                else if (paymentMethod.Equals("Manual", StringComparison.OrdinalIgnoreCase))
                {
                    // Manual payment processing
                    var payment = _mapper.Map<Payment>(dto);
                    payment.PaymentId = Guid.NewGuid();
                    payment.ReceivedBy = userId;
                    payment.PaymentDate = DateTime.UtcNow;
                    payment.Method = "Manual";
                    payment.Reference = reference;

                    await _paymentService.ProcessPaymentAsync(payment, email, reference);

                    // Update installments if payment is for an agreement
                    if (dto.AgreementId.HasValue)
                    {
                        decimal remaining = dto.Amount;
                        var installments = await _context.Installments
                            .Where(i => i.AgreementId == dto.AgreementId && i.Status == InstallmentStatus.Pending)
                            .OrderBy(i => i.DueDate)
                            .ToListAsync();

                        foreach (var installment in installments)
                        {
                            if (remaining <= 0) break;

                            decimal dueRemaining = installment.AmountDue - installment.AmountPaid;
                            if (remaining >= dueRemaining)
                            {
                                installment.AmountPaid = installment.AmountDue;
                                installment.Status = InstallmentStatus.Paid;
                                installment.PaidDate = DateTime.UtcNow;
                                remaining -= dueRemaining;
                            }
                            else
                            {
                                installment.AmountPaid += remaining;
                                remaining = 0;
                            }
                            _context.Installments.Update(installment);
                        }
                        await _context.SaveChangesAsync();
                    }

                    // Invalidate caches
                    _cache.Remove($"user_payments_{userId}_*");
                    _cache.Remove("dashboard");

                    var paymentDto = _mapper.Map<PaymentDto>(payment);
                    return Ok(new { success = true, message = "Payment processed successfully.", data = paymentDto });
                }
                else
                {
                    return BadRequest(new { success = false, message = $"Unsupported payment method: {paymentMethod}. Supported methods: Paystack, Manual" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Payment processing error: {ErrorMessage} | StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                return StatusCode(500, new { success = false, message = "An error occurred while processing payment.", error = ex.Message });
            }
        }

        [HttpPost("confirm/{orderId}")]
        public async Task<IActionResult> ConfirmPayment(Guid orderId, [FromBody] ConfirmPaymentDto dto)
        {
            try
            {
                if (orderId == Guid.Empty)
                    return BadRequest(new { success = false, message = "Invalid order ID." });

                if (dto == null || string.IsNullOrWhiteSpace(dto.TransactionId))
                    return BadRequest(new { success = false, message = "Transaction ID is required." });

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == userId);

                if (order == null)
                    return NotFound(new { success = false, message = "Order not found." });

                // Verify payment with Paystack
                var verificationResult = await _paymentService.VerifyPaymentAsync(dto.TransactionId);

                if (!verificationResult.Success)
                    return BadRequest(new { success = false, message = "Payment verification failed.", details = verificationResult.Message });

                if (verificationResult.Amount != order.Total)
                    return BadRequest(new { success = false, message = $"Verified amount ({verificationResult.Amount}) does not match order total ({order.Total})." });

                // Create payment record
                var payment = new Payment
                {
                    PaymentId = Guid.NewGuid(),
                    OrderId = orderId,
                    Amount = order.Total,
                    PaymentDate = DateTime.UtcNow,
                    Method = "Paystack",
                    Reference = dto.TransactionId,
                    ReceivedBy = userId,
                };
                _context.Payments.Add(payment);

                // Update order status
                order.Status = OrderStatus.Confirmed;

                // Decrement stock on confirmation
                foreach (var item in order.OrderItems)
                {
                    if (item.Product != null)
                    {
                        item.Product.StockQty -= item.Quantity;
                        if (item.Product.StockQty < 0)
                        {
                            return BadRequest(new { success = false, message = $"Insufficient stock for product {item.Product.Name}. Available: {item.Product.StockQty + item.Quantity}, Requested: {item.Quantity}" });
                        }
                        _context.Products.Update(item.Product);
                    }
                }

                await _context.SaveChangesAsync();

                // Create audit log
                var auditLog = new AuditLog
                {
                    LogId = Guid.NewGuid(),
                    UserId = userId != null || userId != Guid.Empty ? userId : null,
                    Action = "Confirm Payment",
                    EntityType = "Payment",
                    EntityId = payment.PaymentId.ToString(),
                    Timestamp = DateTime.UtcNow,
                    Details = $"Payment confirmed for Order {orderId} with reference {dto.TransactionId} and amount {order.Total}",
                };
                await _auditRepo.LogAsync(auditLog);

                // Invalidate caches
                _cache.Remove($"user_orders_{userId}_*");
                _cache.Remove($"user_payments_{userId}_*");
                _cache.Remove("dashboard");
                _cache.Remove("inventory_*");

                return Ok(new { success = true, message = "Payment confirmed successfully.", orderId = orderId });
            }
            catch (Exception ex)
            {
                _logger.LogError("Payment confirmation error: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred while confirming payment.", error = ex.Message });
            }
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> PaystackWebhook()
        {
            try
            {
                await _paymentService.VerifyWebhookAsync(Request);
                return Ok(new { success = true, message = "Webhook processed successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError("Webhook error: {ErrorMessage}", ex.Message);
                return BadRequest(new { success = false, message = "Webhook processing failed.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPayments(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10
        )
        {
            try
            {
                if (page < 1) page = 1;
                if (limit < 1 || limit > 100) limit = 10;

                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                string cacheKey = $"user_payments_{userId}_{page}_{limit}";

                if (!_cache.TryGetValue(cacheKey, out IEnumerable<PaymentDto>? payments))
                {
                    // Fetch payments for orders and agreements belonging to user
                    var paymentEntities = await _context.Payments
                        .Where(p =>
                            (p.OrderId.HasValue && p.Order.CustomerId == userId)
                            || (p.AgreementId.HasValue && p.Agreement.Order.CustomerId == userId)
                        )
                        .OrderByDescending(p => p.PaymentDate)
                        .Skip((page - 1) * limit)
                        .Take(limit)
                        .ToListAsync();

                    payments = _mapper.Map<IEnumerable<PaymentDto>>(paymentEntities);
                    _cache.Set(cacheKey, payments, TimeSpan.FromMinutes(5));
                }

                return Ok(new { success = true, data = payments });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching payments: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred while fetching payments.", error = ex.Message });
            }
        }
    }
}