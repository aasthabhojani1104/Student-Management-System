using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class UserRoleValidator : AbstractValidator<UserRoleDto>
    {
        public UserRoleValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("A valid user must be selected.");

            RuleFor(x => x.RoleId)
                .GreaterThan(0).WithMessage("A valid role must be selected.");
        }
    }
}
