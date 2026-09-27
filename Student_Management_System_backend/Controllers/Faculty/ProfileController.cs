using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Controllers.Faculty
{
    [ApiController]
    [Route("api/faculty/profile")]
    [Authorize(Roles = "Faculty")]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly IWebHostEnvironment _env;

        public ProfileController(IUserService service, IWebHostEnvironment env)
        {
            _service = service;
            _env     = env;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var id   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _service.GetUserById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPut]
        public async Task<IActionResult> Update(UserDto dto)
        {
            var id     = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.UpdateUser(id, dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
