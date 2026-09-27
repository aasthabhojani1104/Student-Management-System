using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Student
{
    [ApiController]
    [Route("api/student/projects")]
    [Authorize(Roles = "Student")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;

        public ProjectController(IProjectService service) => _service = service;

        // GET: api/student/projects — only projects the student is allocated to
        [HttpGet]
        public async Task<IActionResult> GetMyProjects()
        {
            var studentId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var projects = await _service.GetProjectsByStudent(studentId);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var studentId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _service.GetProjectById(id);
            if (project == null) return NotFound();

            // Ensure student is allocated to this project
            var isAllocated = await _service.IsStudentAllocated(id, studentId);
            if (!isAllocated) return Forbid();

            return Ok(project);
        }
    }
}
