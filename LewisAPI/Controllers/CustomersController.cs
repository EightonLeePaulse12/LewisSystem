using System.Security.Claims;
using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

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

                string? profilePictureBase64 = null;
                if (user.ProfilePicture != null && user.ProfilePicture.Length > 0)
                {
                    // Convert the byte array (image data) into a Base64 string
                    profilePictureBase64 = Convert.ToBase64String(user.ProfilePicture);
                }

                // Assumes Customer nav loaded or mapped
                var userDetails = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.PhoneNumber,
                    profilePicture =  (string)profilePictureBase64!,
                    user.CreatedAt,
                };

                return Ok(userDetails);
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

        [HttpPost("profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var user = await _userManager.FindByIdAsync(userId.ToString());

                if (user == null) return NotFound();

                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    user.ProfilePicture = memoryStream.ToArray();
                }

                // This saves the changes to the AspNetUsers table
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok(new { Message = "Profile Picture uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error uploading profile picture: {Message}", ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}
