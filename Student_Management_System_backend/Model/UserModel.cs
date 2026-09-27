using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Management_System.Model
{
   
    public class UserModel:BaseEntity
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ProfilePicturePath { get; set; }

        public bool IsActive { get; set; } = true;


        public ICollection<ProjectAllocationModel> ProjectAllocations { get; set; }
    = new List<ProjectAllocationModel>();

        public ICollection<ProjectModel> ProjectsAsFaculty { get; set; }
    = new List<ProjectModel>();

        public ICollection<UserRoleModel> UserRoles { get; set; }
    = new List<UserRoleModel>();
    }
}