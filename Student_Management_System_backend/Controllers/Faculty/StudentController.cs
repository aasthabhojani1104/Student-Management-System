using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;

namespace Student_Management_System.Controllers.Faculty
{
    /// <summary>
    /// Faculty can view only students allocated to their projects.
    /// </summary>
    [ApiController]
    [Route("api/faculty/students")]
    [Authorize(Roles = "Faculty")]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetMyStudents()
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var students = await _context.ProjectAllocations
                .AsNoTracking()
                .Include(pa => pa.Student)
                    .ThenInclude(s => s!.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .Include(pa => pa.Project)
                .Where(pa => pa.Project!.FacultyId == facultyId && !pa.IsDeleted)
                .Select(pa => new
                {
                    pa.Student!.UserId,
                    pa.Student.FullName,
                    pa.Student.Email,
                    pa.Student.MobileNumber,
                    pa.Student.ProfilePicturePath,
                    pa.Student.IsActive,
                    ProjectId    = pa.ProjectId,
                    ProjectTitle = pa.Project!.ProjectTitle,
                    AllocationId = pa.AllocationID
                })
                .Distinct()
                .ToListAsync();

            return Ok(students);
        }
    }
}
