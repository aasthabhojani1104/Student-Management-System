using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class RoleValidator : AbstractValidator<RoleDto>
    {
        public RoleValidator()
        {
            RuleFor(x => x.RoleName)
                .NotEmpty().WithMessage("Role name is required.")
                .MaximumLength(50).WithMessage("Role name cannot exceed 50 characters.")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Role name can only contain letters and spaces.");

            RuleFor(x => x.Description)
                .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.")
                .When(x => x.Description != null);
        }
    }
}
