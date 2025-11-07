using FluentValidation;
using LewisAPI.DTOs;

namespace LewisAPI.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(p => p.SKU).NotEmpty().MaximumLength(50);
        RuleFor(p => p.Name).NotEmpty().MaximumLength(100);
        RuleFor(p => p.UnitPrice).GreaterThan(0);
        RuleFor(p => p.StockQty).GreaterThanOrEqualTo(0);
        // Add more rules as needed
    }
}
