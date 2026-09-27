using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/allocations")]
    [Authorize(Roles = "Admin")]
    public class ProjectAllocationController : ControllerBase
    {
        private readonly IProjectAllocationService _service;

        public ProjectAllocationController(IProjectAllocationService service)
            => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAll();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(int projectId)
        {
            var list = await _service.GetByProject(projectId);
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Allocate(ProjectAllocationDto dto)
        {
            var result = await _service.Allocate(dto);
            if (result == null)
                return Conflict("This student is already allocated to the project.");
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            var result = await _service.Remove(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
