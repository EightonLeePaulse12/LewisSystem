using FluentValidation;
using LewisAPI.DTOs;

namespace LewisAPI.Validators
{
    public class ResetPasswordDtoValidator : AbstractValidator<ResetPasswordDTO>
    {
        public ResetPasswordDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }
    }
}
