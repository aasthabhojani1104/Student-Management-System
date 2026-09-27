using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class UserRoleService : IUserRoleService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UserRoleService(
            AppDbContext context,
            IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserRoleDto>> GetAllUserRole()
        {
            var userRoles = await _context.UserRoles.ToListAsync();

            return _mapper.Map<IEnumerable<UserRoleDto>>(userRoles);
        }

        public async Task<UserRoleDto?> GetUserRoleById(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);
            return _mapper.Map<UserRoleDto>(userRole);
        }

        public async Task<UserRoleDto> AddUserRole(UserRoleDto userRole)
        {
            var userRoleModel = _mapper.Map<UserRoleModel>(userRole);
            _context.UserRoles.Add(userRoleModel);
            await _context.SaveChangesAsync();
            return _mapper.Map<UserRoleDto>(userRoleModel);


        }

        public async Task<bool> DeleteUserRole(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);
            if (userRole == null) return false;
            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserRole(int id, UserRoleDto userRole)
        {
            var userRoleModel = await _context.UserRoles.FindAsync(id);
            if (userRoleModel == null) return false;
            _mapper.Map(userRole, userRoleModel);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
