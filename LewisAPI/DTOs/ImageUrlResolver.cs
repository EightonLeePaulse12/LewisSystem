using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Models;

public class ProductImageUrlResolver : IValueResolver<Product, ProductListDto, string?>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProductImageUrlResolver(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Resolve(Product source, ProductListDto destination, string? destMember, ResolutionContext context)
    {
        // 1. If there is no image data in the DB, return null
        if (source.ImageUrl == null || source.ImageUrl.Length == 0)
            return null;

        // 2. If the DB contains a text URL (like your Seed Data), just return it
        try
        {
            string potentialUrl = System.Text.Encoding.UTF8.GetString(source.ImageUrl);
            if (potentialUrl.StartsWith("http")) return potentialUrl;
        }
        catch { }

        var request = _httpContextAccessor.HttpContext!.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        // 3. IF IT IS REAL BINARY DATA (Your custom images):
        // Construct the URL: https://localhost:xxxx/api/products/images/{id}

        return $"{baseUrl}/api/products/images/{source.ProductId}";
    }
}