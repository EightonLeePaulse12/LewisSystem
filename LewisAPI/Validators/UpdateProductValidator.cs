using FluentValidation;
using LewisAPI.DTOs;

namespace LewisAPI.Validators
{
    public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductValidator()
        {
            // Rules can be optional here
            RuleFor(p => p.UnitPrice).GreaterThan(0).When(p => p.UnitPrice != default);
        }
    }
}
