using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class RoleService : IRoleService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RoleService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RoleDto>> GetAllRole()
        {
            var roles = await _context.Roles.ToListAsync();

            return _mapper.Map<IEnumerable<RoleDto>>(roles);
        }

        public async Task<RoleDto?> GetRoleById(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return null;
            return _mapper.Map<RoleDto>(role);
        }

        public async Task<RoleDto> CreateRole(RoleDto roleDto)
        {
            var role = _mapper.Map<RoleModel>(roleDto);
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return _mapper.Map<RoleDto>(role);
        }

        public async Task<bool> UpdateRole(int id, RoleDto roleDto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return false;
            _mapper.Map(roleDto, role);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return false;
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}