using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/status")]
    [Authorize(Roles = "Admin")]
    public class StatusController : ControllerBase
    {
        private readonly IStatusService _service;

        public StatusController(IStatusService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllStatus();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetStatusById(id);
            if (item == null) return NotFound($"Status with ID {id} not found.");
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Add(StatusDto dto)
        {
            var item = await _service.AddStatus(dto);
            if (item == null) return Conflict($"Status '{dto.StatusName}' already exists.");
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, StatusDto dto)
        {
            var result = await _service.UpdateStatus(id, dto);
            if (!result) return NotFound($"Status with ID {id} not found.");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteStatus(id);
            if (!result) return NotFound($"Status with ID {id} not found.");
            return NoContent();
        }
    }
}
