using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Management_System.Model
{
    public class RolePermissionModel : BaseEntity
    {
        [Key]
        public int RolePermissionId { get; set; }

        [Required]
        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }

        public RoleModel? Role { get; set; }

        [Required]
        [ForeignKey(nameof(Permission))]
        public int PermissionId { get; set; }

        public PermissionModel? Permission { get; set; }
    }
}
