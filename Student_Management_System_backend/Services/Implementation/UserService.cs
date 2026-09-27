using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class UserServices : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UserServices(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => !u.IsDeleted)
                .ToListAsync();

            var userIds = users.Select(u => u.UserId).ToList();

            // Load role assignments in one query — use GroupBy to handle
            // the edge case where a user has multiple UserRoles rows
            var roleMap = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => userIds.Contains(ur.UserId))
                .GroupBy(ur => ur.UserId)
                .ToDictionaryAsync(g => g.Key, g => g.First());

            return users.Select(u =>
            {
                var dto = _mapper.Map<UserDto>(u);
                if (roleMap.TryGetValue(u.UserId, out var ur))
                {
                    dto.RoleId   = ur.RoleId;
                    dto.RoleName = ur.Role?.RoleName;
                }
                return dto;
            });
        }

        public async Task<UserDto?> GetUserById(int id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id && !u.IsDeleted);

            if (user == null) return null;

            var dto = _mapper.Map<UserDto>(user);

            var ur = await _context.UserRoles
                .AsNoTracking()
                .Include(r => r.Role)
                .FirstOrDefaultAsync(r => r.UserId == id);

            if (ur != null)
            {
                dto.RoleId   = ur.RoleId;
                dto.RoleName = ur.Role?.RoleName;
            }

            return dto;
        }

        // CREATE USER
        public async Task<UserDto> CreateUser(UserDto userDto)
        {
            var user = _mapper.Map<UserModel>(userDto);

            // Hash password
            user.Password = BCrypt.Net.BCrypt.HashPassword(
                userDto.Password);

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            // Assign Role
            if (userDto.RoleId.HasValue)
            {
                var userRole = new UserRoleModel
                {
                    UserId = user.UserId,
                    RoleId = userDto.RoleId.Value
                };

                _context.UserRoles.Add(userRole);

                await _context.SaveChangesAsync();
            }

            return _mapper.Map<UserDto>(user);
        }


        public async Task<bool> UpdateUser(int id, UserDto userDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _mapper.Map(userDto, user);

            // Only update password when a new non-empty value is provided
            if (!string.IsNullOrWhiteSpace(userDto.Password))
                user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
            // else leave user.Password unchanged

            await _context.SaveChangesAsync();

            // Update Role
            if (userDto.RoleId.HasValue)
            {
                var userRole = await _context.UserRoles
                    .FirstOrDefaultAsync(ur => ur.UserId == id);

                if (userRole == null)
                {
                    userRole = new UserRoleModel
                    {
                        UserId = id,
                        RoleId = userDto.RoleId.Value
                    };

                    _context.UserRoles.Add(userRole);
                }
                else
                {
                    userRole.RoleId = userDto.RoleId.Value;
                }

                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return false;

            user.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task UpdateProfilePicture(int id, string profilePicturePath)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return;
            user.ProfilePicturePath = profilePicturePath;
            await _context.SaveChangesAsync();
        }



    }
}