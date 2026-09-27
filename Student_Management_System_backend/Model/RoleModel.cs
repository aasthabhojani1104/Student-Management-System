using System.ComponentModel.DataAnnotations;

namespace Student_Management_System.Model
{
    public class RoleModel:BaseEntity
    {
        [Key]
        public int RoleId { get; set; }

        [Required, MaxLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public ICollection<UserRoleModel> UserRoles { get; set; }
           = new List<UserRoleModel>();

        public ICollection<RolePermissionModel> RolePermissions { get; set; }
            = new List<RolePermissionModel>();
    }
}
