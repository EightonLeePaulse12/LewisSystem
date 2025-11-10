using System.Security.Claims;
using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Customer")]
    public class CreditAgreementController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo; // Reuse since agreements tied to orders
        private readonly IMapper _mapper;
        private readonly ILogger<CreditAgreementController> _logger;

        public CreditAgreementController(
            IOrderRepository orderRepo,
            IMapper mapper,
            ILogger<CreditAgreementController> logger
        )
        {
            _orderRepo = orderRepo;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAgreements()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var orders = await _orderRepo.GetAllAsync(1, int.MaxValue, userId); // All for user; filter in query if needed
                var agreements = orders
                    .Where(o => o.CustomerId == userId && o.CreditAgreement != null)
                    .Select(o => o.CreditAgreement);

                return Ok(_mapper.Map<IEnumerable<CreditAgreementDto>>(agreements));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching agreements: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAgreementDetails(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var order = await _orderRepo.GetByIdAsync(id); // AgreementId or OrderId? Adjust if needed
                if (order == null || order.CustomerId != userId || order.CreditAgreement == null)
                    return NotFound();

                return Ok(_mapper.Map<CreditAgreementDto>(order.CreditAgreement));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching agreement details: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
