using System.ComponentModel.DataAnnotations;

namespace Student_Management_System.Model
{
    public class PermissionModel : BaseEntity
    {
        [Key]
        public int PermissionId { get; set; }

        [Required, MaxLength(100)]
        public string PermissionName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public ICollection<RolePermissionModel> RolePermissions { get; set; }
            = new List<RolePermissionModel>();
    }
}
