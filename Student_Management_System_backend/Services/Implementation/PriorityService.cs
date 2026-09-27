using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class PriorityService : IPriorityService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public PriorityService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper  = mapper;
        }

        public async Task<IEnumerable<PriorityDto>> GetAll()
        {
            var list = await _context.Priorities.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<PriorityDto>>(list);
        }

        public async Task<PriorityDto?> GetById(int id)
        {
            var item = await _context.Priorities.FindAsync(id);
            return item == null ? null : _mapper.Map<PriorityDto>(item);
        }

        public async Task<PriorityDto?> Add(PriorityDto dto)
        {
            var exists = await _context.Priorities
                .AsNoTracking()
                .AnyAsync(p => p.PriorityName.ToLower() == dto.PriorityName.ToLower());
            if (exists) return null;

            var model = _mapper.Map<PriorityModel>(dto);
            _context.Priorities.Add(model);
            await _context.SaveChangesAsync();
            return _mapper.Map<PriorityDto>(model);
        }

        public async Task<bool> Update(int id, PriorityDto dto)
        {
            var model = await _context.Priorities.FindAsync(id);
            if (model == null) return false;
            model.PriorityName     = dto.PriorityName;
            model.PriorityCssClass = dto.PriorityCssClass;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Delete(int id)
        {
            var model = await _context.Priorities.FindAsync(id);
            if (model == null) return false;
            _context.Priorities.Remove(model);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
