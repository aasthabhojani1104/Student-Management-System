using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class ProjectAllocationService : IProjectAllocationService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProjectAllocationService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper  = mapper;
        }

        private IQueryable<ProjectAllocationModel> BaseQuery() =>
            _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .Where(pa => !pa.IsDeleted);

        public async Task<IEnumerable<ProjectAllocationDto>> GetAll()
        {
            var list = await BaseQuery().ToListAsync();
            return _mapper.Map<IEnumerable<ProjectAllocationDto>>(list);
        }

        public async Task<ProjectAllocationDto?> GetById(int id)
        {
            var item = await BaseQuery()
                .FirstOrDefaultAsync(pa => pa.AllocationID == id);
            return item == null ? null : _mapper.Map<ProjectAllocationDto>(item);
        }

        public async Task<IEnumerable<ProjectAllocationDto>> GetByProject(int projectId)
        {
            var list = await BaseQuery()
                .Where(pa => pa.ProjectId == projectId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ProjectAllocationDto>>(list);
        }

        public async Task<IEnumerable<ProjectAllocationDto>> GetByStudent(int studentId)
        {
            var list = await BaseQuery()
                .Where(pa => pa.StudentId == studentId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ProjectAllocationDto>>(list);
        }

        public async Task<ProjectAllocationDto?> Allocate(ProjectAllocationDto dto)
        {
            // Enforce unique (ProjectId, StudentId)
            var exists = await _context.ProjectAllocations
                .AnyAsync(pa => pa.ProjectId == dto.ProjectId
                             && pa.StudentId == dto.StudentId
                             && !pa.IsDeleted);
            if (exists) return null;

            var model = _mapper.Map<ProjectAllocationModel>(dto);
            _context.ProjectAllocations.Add(model);
            await _context.SaveChangesAsync();

            var created = await BaseQuery()
                .FirstAsync(pa => pa.AllocationID == model.AllocationID);
            return _mapper.Map<ProjectAllocationDto>(created);
        }

        public async Task<bool> Remove(int id)
        {
            var model = await _context.ProjectAllocations.FindAsync(id);
            if (model == null || model.IsDeleted) return false;
            model.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
