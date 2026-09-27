using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controller
{
    [ApiController]
    [Route("api/status")]
    [Authorize(Roles = "Admin")]
    public class StatusController : ControllerBase
    {
        private readonly IStatusService _service;

        public StatusController(IStatusService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStatus()
        {
            var statuses = await _service.GetAllStatus();

            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStatusById(int id)
        {
            var status = await _service.GetStatusById(id);
            if (status == null) return NotFound($"Status with ID {id} not found.");
            return Ok(status);
        }

        [HttpPost]
        public async Task<IActionResult> AddStatus(StatusDto dto)
        {
            var status = await _service.AddStatus(dto);
            if (status == null)
                return Conflict($"Status '{dto.StatusName}' already exists.");

            return Ok(status);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, StatusDto dto)
        {
            var result = await _service.UpdateStatus(id, dto);
            if (!result) return NotFound($"Status with ID {id} not found.");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var result = await _service.DeleteStatus(id);
            if (!result) return NotFound($"Status with ID {id} not found.");

            return NoContent();
        }
    }
}