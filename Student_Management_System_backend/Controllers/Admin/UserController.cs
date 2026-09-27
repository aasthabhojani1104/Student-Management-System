using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly IWebHostEnvironment _env;

        public UserController(IUserService service, IWebHostEnvironment env)
        {
            _service = service;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _service.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetUserById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create(UserDto dto)
        {
            var user = await _service.CreateUser(dto);
            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserDto dto)
        {
            var result = await _service.UpdateUser(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteUser(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided.");

            var allowed = new[] { "image/jpeg", "image/png" };
            if (!allowed.Contains(file.ContentType.ToLower()))
                return BadRequest("Only JPEG and PNG files are allowed.");

            if (file.Length > 2 * 1024 * 1024)
                return BadRequest("File size must not exceed 2 MB.");

            var ext       = Path.GetExtension(file.FileName).ToLower();
            var fileName  = $"{id}{ext}";
            var uploadDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(uploadDir);

            var filePath = Path.Combine(uploadDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
                await file.CopyToAsync(stream);

            var relativePath = $"/uploads/avatars/{fileName}";
            await _service.UpdateProfilePicture(id, relativePath);

            return Ok(new { url = relativePath });
        }
    }
}
