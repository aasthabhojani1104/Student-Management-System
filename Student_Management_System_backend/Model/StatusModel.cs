using System.ComponentModel.DataAnnotations;

namespace Student_Management_System.Model
{
    public class StatusModel:BaseEntity
    {
        [Key]
        public int StatusID { get; set; }

        [Required, MaxLength(20)]
        public string StatusName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string StatusCssClass { get; set; } = string.Empty;

    }
}
