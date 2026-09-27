using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;

namespace Student_Management_System.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context) => _context = context;

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
            // KPI counts
            var totalUsers    = await _context.Users.CountAsync(u => !u.IsDeleted);
            var totalProjects = await _context.Projects.CountAsync(p => !p.IsDeleted);
            var totalTasks    = await _context.Tasks.CountAsync(t => !t.IsDeleted);

            var roleCounts = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => !ur.IsDeleted)
                .GroupBy(ur => ur.Role!.RoleName)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync();

            var studentCount = roleCounts.FirstOrDefault(r => r.Role == "Student")?.Count ?? 0;
            var facultyCount = roleCounts.FirstOrDefault(r => r.Role == "Faculty")?.Count  ?? 0;

            // Project status distribution for doughnut chart
            var projectStatusDist = await _context.Projects
                .Where(p => !p.IsDeleted)
                .Include(p => p.Status)
                .GroupBy(p => p.Status!.StatusName)
                .Select(g => new { StatusName = g.Key, Count = g.Count() })
                .ToListAsync();

            // Task priority distribution for bar chart
            var taskPriorityDist = await _context.Tasks
                .Where(t => !t.IsDeleted)
                .Include(t => t.Priority)
                .GroupBy(t => t.Priority!.PriorityName)
                .Select(g => new { PriorityName = g.Key, Count = g.Count() })
                .ToListAsync();

            // Recent 5 projects with status + student
            var recentProjects = await _context.Projects
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Include(p => p.Status)
                .Include(p => p.Faculty)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new
                {
                    p.ProjectId,
                    p.ProjectTitle,
                    p.ProgressPercentage,
                    p.EndDate,
                    StatusName     = p.Status!.StatusName,
                    StatusCssClass = p.Status.StatusCssClass,
                    FacultyName    = p.Faculty!.FullName
                })
                .ToListAsync();

            // Enrich with student name from first allocation
            var projectIds  = recentProjects.Select(p => p.ProjectId).ToList();
            var allocations = await _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Student)
                .Where(pa => projectIds.Contains(pa.ProjectId) && !pa.IsDeleted)
                .ToListAsync();
            var allocMap = allocations.GroupBy(a => a.ProjectId)
                .ToDictionary(g => g.Key, g => g.First().Student?.FullName ?? "—");

            var recentProjectsMapped = recentProjects.Select(p => new
            {
                p.ProjectId, p.ProjectTitle, p.ProgressPercentage,
                p.EndDate, p.StatusName, p.StatusCssClass, p.FacultyName,
                StudentName = allocMap.TryGetValue(p.ProjectId, out var sn) ? sn : "—"
            }).ToList();

            // Recent 5 tasks
            var recentTasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => !t.IsDeleted)
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Allocation)
                    .ThenInclude(a => a!.Project)
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new
                {
                    t.TaskId,
                    t.TaskTitle,
                    ProjectTitle   = t.Allocation!.Project!.ProjectTitle,
                    StatusName     = t.Status!.StatusName,
                    StatusCssClass = t.Status.StatusCssClass,
                    PriorityName   = t.Priority!.PriorityName,
                    PriorityCssClass = t.Priority.PriorityCssClass,
                    t.DueDate
                })
                .ToListAsync();

            return Ok(new
            {
                totalUsers,
                totalProjects,
                totalTasks,
                studentCount,
                facultyCount,
                projectStatusDist,
                taskPriorityDist,
                recentProjects = recentProjectsMapped,
                recentTasks
            });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to load dashboard stats." });
            }
        }
    }
}
