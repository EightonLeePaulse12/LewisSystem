using FluentValidation;
using LewisAPI.DTOs;

namespace LewisAPI.Validators
{
    public class ConfirmResetDtoValidator : AbstractValidator<ConfirmResetDTO>
    {
        public ConfirmResetDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.NewPassword)
                .NotEmpty()
                .MinimumLength(8)
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$");
            RuleFor(x => x.ConfirmNewPassword)
                .Equal(x => x.NewPassword)
                .WithMessage("Passwords must match");
        }
    }
}
