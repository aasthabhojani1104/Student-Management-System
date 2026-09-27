using System.ComponentModel.DataAnnotations;

namespace Student_Management_System.Model
{
    public class PriorityModel:BaseEntity
    {
        [Key]
        public int PriorityID { get; set; }

        [Required, MaxLength(20)]
        public string PriorityName { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PriorityCssClass { get; set; } = string.Empty;
    }
}
