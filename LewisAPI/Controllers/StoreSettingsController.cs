using LewisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class StoreSettingsController : ControllerBase
    {
        private readonly IStoreSettingsRepository _settingsRepo;
        private readonly ILogger<StoreSettingsController> _logger;

        public StoreSettingsController(
            IStoreSettingsRepository settingsRepo,
            ILogger<StoreSettingsController> logger
        )
        {
            _settingsRepo = settingsRepo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _settingsRepo.GetSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching settings: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
