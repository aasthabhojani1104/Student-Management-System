using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetAllRole();

        Task<RoleDto?> GetRoleById(int id);

        Task<RoleDto> CreateRole(RoleDto roleCreateDto);

        Task<bool> DeleteRole(int id);

       Task<bool> UpdateRole(int id, RoleDto roleUpdateDto);
    }
}
