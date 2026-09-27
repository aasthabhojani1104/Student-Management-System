using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Management_System.Model
{
  
    public class TaskModel:BaseEntity
    {
        [Key]
        public int TaskId { get; set; }

        [Required]
        [ForeignKey(nameof(Allocation))]
        public int AllocationID { get; set; }

        public ProjectAllocationModel? Allocation { get; set; }

        [Required]
        [MaxLength(200)]
        public string TaskTitle { get; set; } = string.Empty;

        public string? TaskDescription { get; set; }

        [Required]
        [ForeignKey(nameof(Status))]
        public int TaskStatus { get; set; }

        public StatusModel? Status { get; set; }

        [Required]
        [ForeignKey(nameof(Priority))]
        public int PriorityID { get; set; }

        public PriorityModel? Priority { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal AssignedScore { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EarnedScore { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; } = 0;

        public DateTime? StartDate { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        [StringLength(500)]
        public string? FacultyRemarks { get; set; }

        [StringLength(500)]
        public string? StudentRemarks { get; set; }

    }
}