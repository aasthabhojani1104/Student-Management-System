using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsers();

        Task<UserDto?> GetUserById(int id);

        Task<UserDto> CreateUser(UserDto userCreateDto);

        Task<bool> UpdateUser(int id, UserDto userUpdateDto);

        Task<bool> DeleteUser(int id);

        Task UpdateProfilePicture(int id, string profilePicturePath);
    }
}
