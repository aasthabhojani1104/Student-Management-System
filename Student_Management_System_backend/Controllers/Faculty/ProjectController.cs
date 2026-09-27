using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Faculty
{
    [ApiController]
    [Route("api/faculty/projects")]
    [Authorize(Roles = "Faculty")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;
        private readonly AppDbContext _context;

        public ProjectController(IProjectService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        // GET: api/faculty/projects — only projects where FacultyId == current user
        [HttpGet]
        public async Task<IActionResult> GetMyProjects()
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var projects = await _service.GetProjectsByFaculty(facultyId);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _service.GetProjectById(id);
            if (project == null) return NotFound();
            if (project.FacultyId != facultyId) return Forbid();
            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProjectDto dto)
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            dto.FacultyId = facultyId;
            var result = await _service.CreateProject(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProjectDto dto)
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await _service.GetProjectById(id);
            if (existing == null) return NotFound();
            if (existing.FacultyId != facultyId) return Forbid();
            var result = await _service.UpdateProject(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var facultyId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var existing = await _service.GetProjectById(id);
            if (existing == null) return NotFound();
            if (existing.FacultyId != facultyId) return Forbid();
            var result = await _service.DeleteProject(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
