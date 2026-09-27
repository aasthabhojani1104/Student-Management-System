using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class ProjectAllocationValidator : AbstractValidator<ProjectAllocationDto>
    {
        public ProjectAllocationValidator()
        {
            RuleFor(x => x.ProjectId)
                .GreaterThan(0).WithMessage("A valid project must be selected.");

            RuleFor(x => x.StudentId)
                .GreaterThan(0).WithMessage("A valid student must be selected.");
        }
    }
}
