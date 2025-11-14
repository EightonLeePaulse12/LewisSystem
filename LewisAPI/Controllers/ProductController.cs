using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Interfaces;
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
            var dtos = _mapper.Map<IEnumerable<ProductDto>>(products);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            // Log ex with Serilog
            _logger.LogError("An error occured: {ErrorMessage}", ex);
            return StatusCode(500, "An error occurred while fetching products.");
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
            var dto = _mapper.Map<ProductDto>(product);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError("An error occured: {ErrorMessage}", ex);
            return StatusCode(500, "An error occurred while fetching the product.");
        }
    }
}
