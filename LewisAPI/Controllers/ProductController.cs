using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LewisAPI.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductRepository _productRepo;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductController> _logger;

    public ProductController(
        IProductRepository productRepo,
        IMapper mapper,
        ILogger<ProductController> logger
    )
    {
        _productRepo = productRepo;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        [FromQuery] string? filter = null
    )
    {
        try
        {
            var products = await _productRepo.GetAllAsync(page, limit, filter);
            var dtos = _mapper.Map<IEnumerable<ProductListDto>>(products);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            // Log ex with Serilog
            _logger.LogError("An error occured: {ErrorMessage}", ex);
            return StatusCode(500, "An error occurred while fetching products.");
        }
    }

    [HttpGet("images/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProductImage(Guid id)
    {
        try
        {
            var product = await _productRepo.GetByIdAsync(id);

            // 1. Check if image exists
            if (product == null || product.ImageUrl == null || product.ImageUrl.Length == 0)
            {
                // Return a placeholder or 404
                return NotFound("Image not found.");
            }

            // 2. Attempt to interpret data as String (For Seed Data / Base64)
            string? potentialUrlOrBase64 = null;
            try
            {
                // Only try converting if it looks like text (optimization)
                // Checks first few bytes. 'h' is 104, 'd' is 100.
                if (product.ImageUrl.Length > 0 && product.ImageUrl[0] < 128)
                {
                    potentialUrlOrBase64 = System.Text.Encoding.UTF8.GetString(product.ImageUrl);
                }
            }
            catch { /* Ignore, it's binary */ }

            // 3. Handle Seed Data (Redirect)
            if (!string.IsNullOrEmpty(potentialUrlOrBase64))
            {
                if (potentialUrlOrBase64.StartsWith("http://") || potentialUrlOrBase64.StartsWith("https://"))
                {
                    return Redirect(potentialUrlOrBase64);
                }

                // 4. Handle Base64 String (Safety Net)
                if (potentialUrlOrBase64.StartsWith("data:image") || potentialUrlOrBase64.Length > 200)
                {
                    try
                    {
                        var cleanBase64 = potentialUrlOrBase64.Contains(",")
                            ? potentialUrlOrBase64.Split(',')[1]
                            : potentialUrlOrBase64;

                        byte[] imageBytes = Convert.FromBase64String(cleanBase64);
                        return File(imageBytes, "image/jpeg");
                    }
                    catch
                    {
                        // conversion failed, fall through to binary
                    }
                }
            }

            // 5. Handle Real Binary Data (Your custom uploads)
            // We assume JPEG, but browsers usually detect PNG/GIF automatically even with wrong headers.
            return File(product.ImageUrl, "image/jpeg");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error serving image for product {Id}: {ErrorMessage}", id, ex.Message);
            return StatusCode(500, "Error serving image.");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        try
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return NotFound();
            var dto = _mapper.Map<ProductListDto>(product);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError("An error occured: {ErrorMessage}", ex);
            return StatusCode(500, "An error occurred while fetching the product.");
        }
    }
}
