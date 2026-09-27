using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class UserValidator : AbstractValidator<UserDto>
    {
        public UserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(150).WithMessage("Full name cannot exceed 150 characters.")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Full name can only contain letters and spaces.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Please enter a valid email address.")
                .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

            // Password required only on create (UserId == 0 means new user)
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(255).WithMessage("Password cannot exceed 255 characters.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
                .When(x => x.UserId == 0);

            // On update password is optional — but if provided, enforce rules
            RuleFor(x => x.Password)
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(255).WithMessage("Password cannot exceed 255 characters.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
                .When(x => x.UserId > 0 && !string.IsNullOrWhiteSpace(x.Password));

            RuleFor(x => x.MobileNumber)
                .NotEmpty().WithMessage("Mobile number is required.")
                .Matches(@"^\+?[0-9]{7,15}$").WithMessage("Please enter a valid mobile number (7–15 digits).")
                .MaximumLength(15).WithMessage("Mobile number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                .MaximumLength(500).WithMessage("Profile picture path cannot exceed 500 characters.")
                .When(x => x.ProfilePicturePath != null);

            RuleFor(x => x.RoleId)
                .GreaterThan(0).WithMessage("Please select a valid role.")
                .When(x => x.RoleId.HasValue);
        }
    }
}
