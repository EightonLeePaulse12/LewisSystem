using LewisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LewisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogRepository _auditRepo;
        private readonly ILogger<AuditLogsController> _logger;

        public AuditLogsController(
            IAuditLogRepository auditRepo,
            ILogger<AuditLogsController> logger
        )
        {
            _auditRepo = auditRepo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? filter = null
        )
        {
            try
            {
                var logs = await _auditRepo.GetAllAsync(page, limit, filter); // Assume repo has this method
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error fetching audit logs: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
