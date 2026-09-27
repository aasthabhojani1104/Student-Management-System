using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TaskService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper  = mapper;
        }

        private IQueryable<TaskModel> BaseQuery() =>
            _context.Tasks
                .AsNoTracking()
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Allocation)
                    .ThenInclude(a => a!.Project)
                .Include(t => t.Allocation)
                    .ThenInclude(a => a!.Student)
                .Where(t => !t.IsDeleted);

        // Recalculate TotalTasks, CompletedTasks, ProgressPercentage on the parent project
        private async Task RecalcProjectProgress(int allocationId)
        {
            var allocation = await _context.ProjectAllocations
                .FirstOrDefaultAsync(pa => pa.AllocationID == allocationId);
            if (allocation == null) return;

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == allocation.ProjectId);
            if (project == null) return;

            // Get all allocation IDs for this project
            var allocIds = await _context.ProjectAllocations
                .Where(pa => pa.ProjectId == project.ProjectId && !pa.IsDeleted)
                .Select(pa => pa.AllocationID)
                .ToListAsync();

            var tasks = await _context.Tasks
                .Where(t => allocIds.Contains(t.AllocationID) && !t.IsDeleted)
                .Select(t => new { t.TaskStatus, t.ProgressPercentage })
                .ToListAsync();

            // Find the "Completed" status by name to avoid hardcoding an ID
            var completedStatusId = await _context.Statuses
                .Where(s => s.StatusName.ToLower() == "completed" && !s.IsDeleted)
                .Select(s => s.StatusID)
                .FirstOrDefaultAsync();

            var total     = tasks.Count;
            var completed = completedStatusId > 0
                ? tasks.Count(t => t.TaskStatus == completedStatusId)
                : 0;

            project.TotalTasks      = total;
            project.CompletedTasks  = completed;
            project.ProgressPercentage = total > 0
                ? Math.Round((decimal)completed / total * 100, 2)
                : 0;

            await _context.SaveChangesAsync();
        }

        // Auto-set task progress % based on status name
        private async Task SetTaskProgress(TaskModel model)
        {
            var statusName = await _context.Statuses
                .Where(s => s.StatusID == model.TaskStatus && !s.IsDeleted)
                .Select(s => s.StatusName.ToLower())
                .FirstOrDefaultAsync();

            model.ProgressPercentage = statusName switch
            {
                "completed"   => 100,
                "in progress" => model.ProgressPercentage > 0 ? model.ProgressPercentage : 50,
                "not started" => 0,
                "on hold"     => model.ProgressPercentage,
                _             => model.ProgressPercentage
            };
        }

        public async Task<IEnumerable<TaskDto>> GetAll()
        {
            var list = await BaseQuery().ToListAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(list);
        }

        public async Task<TaskDto?> GetById(int taskId)
        {
            var item = await BaseQuery()
                .FirstOrDefaultAsync(t => t.TaskId == taskId);
            return item == null ? null : _mapper.Map<TaskDto>(item);
        }

        public async Task<IEnumerable<TaskDto>> GetByAllocation(int allocationId)
        {
            var list = await BaseQuery()
                .Where(t => t.AllocationID == allocationId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(list);
        }

        public async Task<IEnumerable<TaskDto>> GetByStudent(int studentId)
        {
            var allocationIds = await _context.ProjectAllocations
                .AsNoTracking()
                .Where(pa => pa.StudentId == studentId && !pa.IsDeleted)
                .Select(pa => pa.AllocationID)
                .ToListAsync();

            var list = await BaseQuery()
                .Where(t => allocationIds.Contains(t.AllocationID))
                .ToListAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(list);
        }

        public async Task<IEnumerable<TaskDto>> GetByFaculty(int facultyId)
        {
            var projectIds = await _context.Projects
                .AsNoTracking()
                .Where(p => p.FacultyId == facultyId && !p.IsDeleted)
                .Select(p => p.ProjectId)
                .ToListAsync();

            var allocationIds = await _context.ProjectAllocations
                .AsNoTracking()
                .Where(pa => projectIds.Contains(pa.ProjectId) && !pa.IsDeleted)
                .Select(pa => pa.AllocationID)
                .ToListAsync();

            var list = await BaseQuery()
                .Where(t => allocationIds.Contains(t.AllocationID))
                .ToListAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(list);
        }

        public async Task<TaskDto> Create(TaskDto dto)
        {
            var model = _mapper.Map<TaskModel>(dto);
            await SetTaskProgress(model);
            _context.Tasks.Add(model);
            await _context.SaveChangesAsync();

            // Recalculate parent project progress
            await RecalcProjectProgress(model.AllocationID);

            var created = await BaseQuery()
                .FirstAsync(t => t.TaskId == model.TaskId);
            return _mapper.Map<TaskDto>(created);
        }

        public async Task<bool> Update(int id, TaskDto dto)
        {
            var model = await _context.Tasks.FindAsync(id);
            if (model == null || model.IsDeleted) return false;

            _mapper.Map(dto, model);
            model.AllocationID = dto.AllocationId;
            model.PriorityID   = dto.PriorityId;

            // Auto-set progress based on status name
            await SetTaskProgress(model);

            await _context.SaveChangesAsync();

            // Recalculate parent project progress
            await RecalcProjectProgress(model.AllocationID);

            return true;
        }

        public async Task<bool> Delete(int id)
        {
            var model = await _context.Tasks.FindAsync(id);
            if (model == null || model.IsDeleted) return false;

            var allocationId = model.AllocationID;
            model.IsDeleted  = true;
            await _context.SaveChangesAsync();

            // Recalculate parent project progress
            await RecalcProjectProgress(allocationId);

            return true;
        }
    }
}
