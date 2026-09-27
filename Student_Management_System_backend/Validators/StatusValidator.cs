using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class StatusValidator : AbstractValidator<StatusDto>
    {
        private static readonly string[] AllowedCssClasses =
        {
            "bg-success", "bg-warning", "bg-danger",
            "bg-primary", "bg-secondary", "bg-dark", "bg-info", "bg-light"
        };

        public StatusValidator()
        {
            RuleFor(x => x.StatusName)
                .NotEmpty().WithMessage("Status name is required.")
                .MaximumLength(20).WithMessage("Status name cannot exceed 20 characters.")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Status name can only contain letters and spaces.");

            RuleFor(x => x.StatusCssClass)
                .NotEmpty().WithMessage("CSS class is required.")
                .MaximumLength(100).WithMessage("CSS class cannot exceed 100 characters.")
                .Must(css => AllowedCssClasses.Contains(css))
                .WithMessage($"CSS class must be one of: {string.Join(", ", AllowedCssClasses)}.");
        }
    }
}
