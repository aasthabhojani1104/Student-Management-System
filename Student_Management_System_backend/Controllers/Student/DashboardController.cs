using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;

namespace Student_Management_System.Controllers.Student
{
    [ApiController]
    [Route("api/student/dashboard")]
    [Authorize(Roles = "Student")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context) => _context = context;

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var allocations = await _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Project)
                    .ThenInclude(p => p!.Status)
                .Include(pa => pa.Project)
                    .ThenInclude(p => p!.Faculty)
                .Where(pa => pa.StudentId == studentId && !pa.IsDeleted)
                .ToListAsync();

            var allocIds = allocations.Select(pa => pa.AllocationID).ToList();

            var tasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Allocation)
                    .ThenInclude(a => a!.Project)
                .Where(t => allocIds.Contains(t.AllocationID) && !t.IsDeleted)
                .ToListAsync();

            var completedStatusId = await _context.Statuses
                .Where(s => s.StatusName.ToLower() == "completed")
                .Select(s => s.StatusID)
                .FirstOrDefaultAsync();

            var completedTasks = completedStatusId > 0
                ? tasks.Count(t => t.TaskStatus == completedStatusId)
                : 0;

            var totalEarned   = tasks.Sum(t => t.EarnedScore ?? 0);
            var totalAssigned = tasks.Sum(t => t.AssignedScore);
            var scorePercent  = totalAssigned > 0
                ? Math.Round((double)totalEarned / (double)totalAssigned * 100, 1)
                : 0;

            // My projects
            var myProjects = allocations
                .Where(pa => pa.Project != null && !pa.Project.IsDeleted)
                .Select(pa => new
                {
                    pa.Project!.ProjectId,
                    pa.Project.ProjectTitle,
                    pa.Project.ProgressPercentage,
                    pa.Project.TotalTasks,
                    pa.Project.CompletedTasks,
                    pa.Project.EndDate,
                    StatusName     = pa.Project.Status?.StatusName ?? "",
                    StatusCssClass = pa.Project.Status?.StatusCssClass ?? "",
                    FacultyName    = pa.Project.Faculty?.FullName ?? ""
                }).ToList();

            // Upcoming tasks
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
                totalProjects  = allocations.Count(pa => pa.Project != null && !pa.Project.IsDeleted),
                totalTasks     = tasks.Count,
                completedTasks,
                scorePercent,
                myProjects,
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
