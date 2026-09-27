using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controller
{
    [ApiController]
    [Route("api/userroles")]
    [Authorize(Roles = "Admin")]
    public class UserRoleController : ControllerBase
    {
        private readonly IUserRoleService _service;

        public UserRoleController(IUserRoleService service)
        {
            _service = service;
        }

  
        [HttpGet]
        public async Task<IActionResult> GetAllUserRole()
        {
            var result = await _service.GetAllUserRole();

            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserRoleById(int id)
        {
            var result = await _service.GetUserRoleById(id);

            return Ok(result);
        }

  
        [HttpPost]
        public async Task<IActionResult> AddUserRole(UserRoleDto dto)
        {
            var result = await _service.AddUserRole(dto);

            return Ok(result);
        }

     
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserRole(
            int id,
            UserRoleDto dto)
        {   
            var result = await _service.UpdateUserRole(id, dto);
            return NoContent();
        }

      
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserRole(int id)
        {
            var result = await _service.DeleteUserRole(id);
            return Ok();
        }
    }
}