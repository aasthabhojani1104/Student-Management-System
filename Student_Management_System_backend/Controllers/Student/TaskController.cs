using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Student
{
    [ApiController]
    [Route("api/student/tasks")]
    [Authorize(Roles = "Student")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _service;

        public TaskController(ITaskService service) => _service = service;

        // GET: api/student/tasks — only tasks for this student
        [HttpGet]
        public async Task<IActionResult> GetMyTasks()
        {
            var studentId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var list = await _service.GetByStudent(studentId);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // Students can only update their own remarks on a task
        [HttpPatch("{id}/remarks")]
        public async Task<IActionResult> UpdateRemarks(int id, [FromBody] string studentRemarks)
        {
            var task = await _service.GetById(id);
            if (task == null) return NotFound();

            task.StudentRemarks = studentRemarks;
            var result = await _service.Update(id, task);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
