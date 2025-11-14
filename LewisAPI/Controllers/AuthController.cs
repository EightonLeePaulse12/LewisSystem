using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LewisAPI.DTOs;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _dbContext; // Added for saving Customer
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext _context;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext dbContext,
            IConfiguration config,
            ILogger<AuthController> logger,
            ApplicationDbContext context
        )
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _config = config;
            _logger = logger;
            _context = context;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                Name = dto.Name,
                PhoneNumber = dto.Phone,
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Customer");
                var customer = new Customer
                {
                    CustomerId = user.Id,
                    Address = dto.Address,
                    City = dto.City,
                    PostalCode = dto.PostalCode,
                    IDNumber = dto.IDNumber,
                };
                _dbContext.Customers.Add(customer); // Save to DB
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("User registered: {UserId}", user.Id);
                return Ok(new { message = "Registered Successfully" });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(user); // Get roles
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Use ID as Sub
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role)); // Add roles to claims
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"]!,
                audience: _config["Jwt:Audience"]!,
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);
            _logger.LogInformation("User logged in: {UserId}", user.Id);

            //var userRoles = await _userManager.GetRolesAsync(user);

            //var userRole = await _context.UserRoles.FindAsync(user.Id);

            var userDetails = new
            {
                user.Id,
                user.Email,
                user.Name,
                user.PhoneNumber,
                user.ProfilePicture,
                roles,
            };

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), userDetails });
        }

        [HttpPost("password-reset")]
        [AllowAnonymous]
        public async Task<IActionResult> PasswordReset(
            [FromBody] ResetPasswordDTO dto,
            [FromServices] IEmailService emailService,
            IConfiguration Config
        )
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var frontendUrl = Config["AppSettings:FrontendUrl"];
            var resetLink = $"{frontendUrl}/reset-password?email={dto.Email}&token={encodedToken}";

            string subject = "Password Reset Request";
            string htmlBody =
                $"<p>Hi {user.UserName},</p>"
                + $"<p>Please <a href=\"{resetLink}\">click here</a> to reset your password.</p>";
            string plainTextBody =
                $"Hi {user.UserName},\n\n"
                + $"Please go to the following link to reset your password: {resetLink}";

            _logger.LogInformation("Password reset requested for: {Email}", dto.Email);
            return Ok(new { message = "Reset link sent" });
        }

        [HttpPost("password-reset/confirm")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmPasswordReset([FromBody] ConfirmResetDTO dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("User not found");

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (result.Succeeded)
            {
                _logger.LogInformation("Password reset for: {UserId}", user.Id);
                return Ok(new { message = "Password reset successful" });
            }
            return BadRequest(result.Errors);
        }
    }
}
