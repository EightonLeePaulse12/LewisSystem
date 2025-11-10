using System.Security.Claims;
using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Any authenticated user
    public class CustomersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<CustomersController> logger
        )
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    return NotFound();

                var profile = _mapper.Map<ProfileDto>(user); // Assumes Customer nav loaded or mapped
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching profile: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    return NotFound();

                _mapper.Map(dto, user);
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                // Update Customer if separate
                var customer = await _context.Customers.FirstOrDefaultAsync(c =>
                    c.CustomerId == userId
                );
                if (customer != null)
                {
                    _mapper.Map(dto, customer);
                    _context.Customers.Update(customer);
                    await _context.SaveChangesAsync();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError("Error updating profile: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
