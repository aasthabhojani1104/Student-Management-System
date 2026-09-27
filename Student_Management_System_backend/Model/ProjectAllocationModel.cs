using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Management_System.Model
{
   
    public class ProjectAllocationModel: BaseEntity
    {
        [Key]
        public int AllocationID { get; set; }

        [Required]
        [ForeignKey(nameof(Project))]
        public int ProjectId { get; set; }

        public ProjectModel? Project { get; set; }


        [Required]
        [ForeignKey(nameof(Student))]
        public int StudentId { get; set; }

        public UserModel? Student { get; set; }


        public DateTime AssignedDate { get; set; } = DateTime.Now;


        
         public ICollection<TaskModel> Tasks { get; set; } = new List<TaskModel>();
    }
}