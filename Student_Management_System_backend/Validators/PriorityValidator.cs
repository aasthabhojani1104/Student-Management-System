using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class PriorityValidator : AbstractValidator<PriorityDto>
    {
        private static readonly string[] AllowedCssClasses =
        {
            "bg-success", "bg-warning", "bg-danger",
            "bg-primary", "bg-secondary", "bg-dark", "bg-info"
        };

        public PriorityValidator()
        {
            RuleFor(x => x.PriorityName)
                .NotEmpty().WithMessage("Priority name is required.")
                .MaximumLength(20).WithMessage("Priority name cannot exceed 20 characters.")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Priority name can only contain letters and spaces.");

            RuleFor(x => x.PriorityCssClass)
                .NotEmpty().WithMessage("CSS class is required.")
                .MaximumLength(20).WithMessage("CSS class cannot exceed 20 characters.")
                .Must(css => AllowedCssClasses.Contains(css))
                .WithMessage($"CSS class must be one of: {string.Join(", ", AllowedCssClasses)}.");
        }
    }
}
