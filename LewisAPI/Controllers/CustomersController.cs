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
                // 1. Get the raw string claim value
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdString == null) return Unauthorized();

                // 2. ✅ FIX: Parse the string claim into a Guid. This is the correct type 
                //    for comparison against your User model's Guid primary key.
                Guid userIdGuid = Guid.Parse(userIdString);

                // 3. RETRIEVAL FIX: Use the Guid variable for comparison.
                //    EF Core (Npgsql) will correctly translate u.Id (Guid) == userIdGuid (Guid) 
                //    into a valid PostgreSQL query (WHERE Id = 'uuid-value').
                var user = await _context.Users
                                         .SingleOrDefaultAsync(u => u.Id == userIdGuid);

                if (user == null)
                    return NotFound();

                // ... (Image Conversion and Return Logic Remains The Same)
                string? imageUrl = null;
                if (user.ProfilePicture != null)
                {
                    string profilePictureBase64 = Convert.ToBase64String(user.ProfilePicture);

                    // ⚠️ Ensure the MIME type below matches the file type in user.ProfilePicture!
                    imageUrl = $"data:image/jpeg;base64,{profilePictureBase64}";
                }

                _logger.LogInformation("Profile retrieved for user {Id}. Picture present: {IsPresent}",
                                        user.Id, imageUrl != null);

                var userDetails = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.PhoneNumber,
                    profilePicture = imageUrl,
                    user.CreatedAt,
                };

                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching profile for user {Id}: {Message}",
                                    User.FindFirstValue(ClaimTypes.NameIdentifier), ex.Message);
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
