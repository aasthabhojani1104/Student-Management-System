using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IUserRoleService
    {

        Task<IEnumerable<UserRoleDto>> GetAllUserRole();

        Task<UserRoleDto?> GetUserRoleById(int id);

        Task<UserRoleDto> AddUserRole(UserRoleDto dto);

        Task<bool> UpdateUserRole(int id, UserRoleDto dto);

        Task<bool> DeleteUserRole(int id);




    }
}
