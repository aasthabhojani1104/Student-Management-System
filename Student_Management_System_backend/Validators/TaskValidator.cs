using FluentValidation;
using Student_Management_System.DTO;

namespace Student_Management_System.Validators
{
    public class TaskValidator : AbstractValidator<TaskDto>
    {
        public TaskValidator()
        {
            RuleFor(x => x.AllocationId)
                .GreaterThan(0).WithMessage("A valid project allocation must be selected.");

            RuleFor(x => x.TaskTitle)
                .NotEmpty().WithMessage("Task title is required.")
                .MaximumLength(200).WithMessage("Task title cannot exceed 200 characters.");

            RuleFor(x => x.TaskDescription)
                .MaximumLength(2000).WithMessage("Task description cannot exceed 2000 characters.")
                .When(x => x.TaskDescription != null);

            RuleFor(x => x.TaskStatus)
                .GreaterThan(0).WithMessage("A valid task status must be selected.");

            RuleFor(x => x.PriorityId)
                .GreaterThan(0).WithMessage("A valid priority must be selected.");

            RuleFor(x => x.AssignedScore)
                .GreaterThanOrEqualTo(0).WithMessage("Assigned score cannot be negative.")
                .LessThanOrEqualTo(100).WithMessage("Assigned score cannot exceed 100.");

            RuleFor(x => x.EarnedScore)
                .GreaterThanOrEqualTo(0).WithMessage("Earned score cannot be negative.")
                .LessThanOrEqualTo(x => x.AssignedScore).WithMessage("Earned score cannot exceed assigned score.")
                .When(x => x.EarnedScore.HasValue);

            RuleFor(x => x.StartDate)
                .LessThan(x => x.DueDate).WithMessage("Start date must be before due date.")
                .When(x => x.StartDate.HasValue && x.DueDate.HasValue);

            RuleFor(x => x.DueDate)
                .GreaterThan(x => x.StartDate).WithMessage("Due date must be after start date.")
                .When(x => x.StartDate.HasValue && x.DueDate.HasValue);

            RuleFor(x => x.FacultyRemarks)
                .MaximumLength(500).WithMessage("Faculty remarks cannot exceed 500 characters.")
                .When(x => x.FacultyRemarks != null);

            RuleFor(x => x.StudentRemarks)
                .MaximumLength(500).WithMessage("Student remarks cannot exceed 500 characters.")
                .When(x => x.StudentRemarks != null);
        }
    }
}
