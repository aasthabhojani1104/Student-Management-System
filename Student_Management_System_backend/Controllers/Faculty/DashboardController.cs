using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;

namespace Student_Management_System.Controllers.Faculty
{
    [ApiController]
    [Route("api/faculty/dashboard")]
    [Authorize(Roles = "Faculty")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context) => _context = context;

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
            var facultyId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var projects = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Status)
                .Where(p => p.FacultyId == facultyId && !p.IsDeleted)
                .ToListAsync();

            var projectIds = projects.Select(p => p.ProjectId).ToList();

            var allocationIds = await _context.ProjectAllocations
                .AsNoTracking()
                .Where(pa => projectIds.Contains(pa.ProjectId) && !pa.IsDeleted)
                .Select(pa => new { pa.AllocationID, pa.StudentId })
                .ToListAsync();

            var allocIds     = allocationIds.Select(a => a.AllocationID).ToList();
            var studentCount = allocationIds.Select(a => a.StudentId).Distinct().Count();

            var tasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Allocation)
                    .ThenInclude(a => a!.Project)
                .Where(t => allocIds.Contains(t.AllocationID) && !t.IsDeleted)
                .ToListAsync();

            // Completed status name
            var completedStatusId = await _context.Statuses
                .Where(s => s.StatusName.ToLower() == "completed")
                .Select(s => s.StatusID)
                .FirstOrDefaultAsync();

            var inProgressStatusId = await _context.Statuses
                .Where(s => s.StatusName.ToLower() == "in progress")
                .Select(s => s.StatusID)
                .FirstOrDefaultAsync();

            var activeTasks    = tasks.Count(t => t.TaskStatus == inProgressStatusId);
            var completedProjects = completedStatusId > 0
                ? projects.Count(p => p.ProjectStatus == completedStatusId)
                : 0;

            // Chart: project progress
            var projectProgress = projects.Select(p => new
            {
                p.ProjectTitle,
                p.ProgressPercentage,
                StatusName     = p.Status?.StatusName ?? "",
                StatusCssClass = p.Status?.StatusCssClass ?? ""
            }).ToList();

            // Upcoming tasks (not completed, sorted by due date)
            var upcoming = tasks
                .Where(t => t.TaskStatus != completedStatusId && t.DueDate.HasValue)
                .OrderBy(t => t.DueDate)
                .Take(6)
                .Select(t => new
                {
                    t.TaskId,
                    t.TaskTitle,
                    ProjectTitle     = t.Allocation?.Project?.ProjectTitle,
                    StatusName       = t.Status?.StatusName ?? "",
                    StatusCssClass   = t.Status?.StatusCssClass ?? "",
                    PriorityName     = t.Priority?.PriorityName ?? "",
                    PriorityCssClass = t.Priority?.PriorityCssClass ?? "",
                    t.DueDate
                }).ToList();

            return Ok(new
            {
                totalProjects  = projects.Count,
                studentCount,
                totalTasks     = tasks.Count,
                activeTasks,
                completedProjects,
                projectProgress,
                upcoming
            });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to load dashboard stats." });
            }
        }
    }
}
