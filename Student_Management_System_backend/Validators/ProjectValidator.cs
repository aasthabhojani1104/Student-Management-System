using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class ProjectValidator : AbstractValidator<ProjectDto>
    {
        public ProjectValidator()
        {
            RuleFor(x => x.ProjectTitle)
                .NotEmpty().WithMessage("Project title is required.")
                .MaximumLength(200).WithMessage("Project title cannot exceed 200 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.")
                .When(x => x.Description != null);

            RuleFor(x => x.FacultyId)
                .GreaterThan(0).WithMessage("A supervising faculty member must be selected.");

            RuleFor(x => x.ProjectStatus)
                .GreaterThan(0).WithMessage("A valid project status must be selected.");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("Start date is required.")
                .LessThan(x => x.EndDate).WithMessage("Start date must be before end date.");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("End date is required.")
                .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");

            RuleFor(x => x.StudentId)
                .GreaterThan(0).WithMessage("A valid student must be selected.")
                .When(x => x.StudentId.HasValue && x.StudentId.Value != 0);
        }
    }
}
