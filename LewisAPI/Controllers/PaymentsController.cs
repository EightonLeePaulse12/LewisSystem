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

        public PaymentsController(
            IPaymentService paymentService,
            UserManager<ApplicationUser> userManager,
            ILogger<PaymentsController> logger,
            ApplicationDbContext context,
            IMapper mapper,
            IMemoryCache cache
        )
        {
            _paymentService = paymentService;
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        [HttpPost]
        public async Task<IActionResult> MakePayment([FromBody] PaymentDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var payment = _mapper.Map<Payment>(dto);
                payment.ReceivedBy = userId;
                payment.PaymentDate = DateTime.UtcNow;

                await _paymentService.ProcessPaymentAsync(payment, dto.StripeToken);

                // Update installment if for agreement
                if (dto.AgreementId.HasValue)
                {
                    var nextInstallment = await _context
                        .Installments.Where(i =>
                            i.AgreementId == dto.AgreementId
                            && i.Status == InstallmentStatus.Pending
                        )
                        .OrderBy(i => i.DueDate)
                        .FirstOrDefaultAsync();

                    if (nextInstallment != null)
                    {
                        nextInstallment.AmountPaid += dto.Amount;
                        if (nextInstallment.AmountPaid >= nextInstallment.AmountDue)
                        {
                            nextInstallment.Status = InstallmentStatus.Paid;
                            nextInstallment.PaidDate = DateTime.UtcNow;
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                // Invalidate user payments cache
                _cache.Remove($"user_payments_{userId}_*");
                _cache.Remove("dashboard");

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                return StatusCode(500, "An error occurred while processing payment.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPayments(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10
        )
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string cacheKey = $"user_payments_{userId}_{page}_{limit}";
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Payment>? payments))
            {
                try
                {
                    payments = await _context
                        .Payments.Include(p => p.Order)
                        .Include(p => p.Agreement)
                        .ThenInclude(ca => ca != null ? ca.Order : null)
                        .Where(p =>
                            (p.OrderId.HasValue && p.Order.CustomerId == userId)
                            || (p.AgreementId.HasValue && p.Agreement.Order.CustomerId == userId)
                        )
                        .OrderByDescending(p => p.PaymentDate)
                        .Skip((page - 1) * limit)
                        .Take(limit)
                        .ToListAsync();
                    _cache.Set(cacheKey, payments, TimeSpan.FromMinutes(5));
                }
                catch (Exception ex)
                {
                    _logger.LogError("An error occurred: {ErrorMessage}", ex.Message);
                    return StatusCode(500, "An error occurred while fetching payments.");
                }
            }
            return Ok(payments);
        }
    }
}
