using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProjectService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper  = mapper;
        }

        private IQueryable<ProjectModel> BaseQuery() =>
            _context.Projects
                .AsNoTracking()
                .Include(p => p.Status)
                .Include(p => p.Faculty)
                .Where(p => !p.IsDeleted);

        // Enrich a single ProjectDto with student info from its first allocation
        private async Task EnrichWithAllocation(ProjectDto dto)
        {
            var alloc = await _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Student)
                .Where(pa => pa.ProjectId == dto.ProjectId && !pa.IsDeleted)
                .FirstOrDefaultAsync();

            if (alloc != null)
            {
                dto.StudentId    = alloc.StudentId;
                dto.StudentName  = alloc.Student?.FullName;
                dto.AllocationId = alloc.AllocationID;
            }
        }

        // Enrich a list of ProjectDtos — one query for all allocations (no N+1)
        private async Task EnrichListWithAllocations(List<ProjectDto> dtos)
        {
            var projectIds = dtos.Select(d => d.ProjectId).ToList();

            var allocs = await _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Student)
                .Where(pa => projectIds.Contains(pa.ProjectId) && !pa.IsDeleted)
                .ToListAsync();

            var allocMap = allocs
                .GroupBy(a => a.ProjectId)
                .ToDictionary(g => g.Key, g => g.First());

            foreach (var dto in dtos)
            {
                if (allocMap.TryGetValue(dto.ProjectId, out var a))
                {
                    dto.StudentId    = a.StudentId;
                    dto.StudentName  = a.Student?.FullName;
                    dto.AllocationId = a.AllocationID;
                }
            }
        }

        public async Task<IEnumerable<ProjectDto>> GetAll()
        {
            var list = await BaseQuery().ToListAsync();
            var dtos = _mapper.Map<List<ProjectDto>>(list);
            await EnrichListWithAllocations(dtos);
            return dtos;
        }

        public async Task<ProjectDto?> GetProjectById(int id)
        {
            var item = await BaseQuery().FirstOrDefaultAsync(p => p.ProjectId == id);
            if (item == null) return null;
            var dto = _mapper.Map<ProjectDto>(item);
            await EnrichWithAllocation(dto);
            return dto;
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsByFaculty(int facultyId)
        {
            var list = await BaseQuery()
                .Where(p => p.FacultyId == facultyId)
                .ToListAsync();
            var dtos = _mapper.Map<List<ProjectDto>>(list);
            await EnrichListWithAllocations(dtos);
            return dtos;
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsByStudent(int studentId)
        {
            var projectIds = await _context.ProjectAllocations
                .AsNoTracking()
                .Where(pa => pa.StudentId == studentId && !pa.IsDeleted)
                .Select(pa => pa.ProjectId)
                .ToListAsync();

            var list = await BaseQuery()
                .Where(p => projectIds.Contains(p.ProjectId))
                .ToListAsync();

            var dtos = _mapper.Map<List<ProjectDto>>(list);
            await EnrichListWithAllocations(dtos);
            return dtos;
        }

        public async Task<bool> IsStudentAllocated(int projectId, int studentId)
        {
            return await _context.ProjectAllocations
                .AsNoTracking()
                .AnyAsync(pa => pa.ProjectId == projectId
                             && pa.StudentId == studentId
                             && !pa.IsDeleted);
        }

        public async Task<ProjectDto> CreateProject(ProjectDto dto)
        {
            var model = _mapper.Map<ProjectModel>(dto);
            _context.Projects.Add(model);
            await _context.SaveChangesAsync();

            // Auto-create allocation if StudentId is provided
            if (dto.StudentId.HasValue && dto.StudentId.Value > 0)
            {
                _context.ProjectAllocations.Add(new ProjectAllocationModel
                {
                    ProjectId = model.ProjectId,
                    StudentId = dto.StudentId.Value
                });
                await _context.SaveChangesAsync();
            }

            var created = await BaseQuery()
                .FirstAsync(p => p.ProjectId == model.ProjectId);
            var result = _mapper.Map<ProjectDto>(created);
            await EnrichWithAllocation(result);
            return result;
        }

        public async Task<bool> UpdateProject(int id, ProjectDto dto)
        {
            var model = await _context.Projects.FindAsync(id);
            if (model == null || model.IsDeleted) return false;
            _mapper.Map(dto, model);
            await _context.SaveChangesAsync();

            // Update allocation if StudentId changed
            if (dto.StudentId.HasValue && dto.StudentId.Value > 0)
            {
                var alloc = await _context.ProjectAllocations
                    .FirstOrDefaultAsync(pa => pa.ProjectId == id && !pa.IsDeleted);

                if (alloc == null)
                {
                    _context.ProjectAllocations.Add(new ProjectAllocationModel
                    {
                        ProjectId = id,
                        StudentId = dto.StudentId.Value
                    });
                }
                else if (alloc.StudentId != dto.StudentId.Value)
                {
                    alloc.StudentId = dto.StudentId.Value;
                }
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> DeleteProject(int id)
        {
            var model = await _context.Projects.FindAsync(id);
            if (model == null || model.IsDeleted) return false;

            // Cascade soft-delete to allocations and their tasks
            var allocations = await _context.ProjectAllocations
                .Where(pa => pa.ProjectId == id && !pa.IsDeleted)
                .ToListAsync();

            var allocIds = allocations.Select(a => a.AllocationID).ToList();

            if (allocIds.Any())
            {
                var tasks = await _context.Tasks
                    .Where(t => allocIds.Contains(t.AllocationID) && !t.IsDeleted)
                    .ToListAsync();

                foreach (var task in tasks)
                    task.IsDeleted = true;

                foreach (var alloc in allocations)
                    alloc.IsDeleted = true;
            }

            model.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
