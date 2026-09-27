using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Management_System.Model
{

    public class ProjectModel: BaseEntity
    {
        [Key]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProjectTitle { get; set; } = string.Empty;

        public string? Description { get; set; }


        [Required]
        [ForeignKey(nameof(Faculty))]
        public int FacultyId { get; set; }

        public UserModel? Faculty { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.Now;

      

        [Required]
        [ForeignKey(nameof(Status))]
        public int ProjectStatus { get; set; }

        public StatusModel? Status { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int TotalTasks { get; set; } = 0;

        public int CompletedTasks { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; } = 0;

        public ICollection<ProjectAllocationModel> ProjectAllocations { get; set; }
            = new List<ProjectAllocationModel>();
    }
}