using JWTDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Services.Interface;
using System.Security.Claims;

namespace Student_Management_System.Controllers.Auth
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _env;
        private readonly TokenService _tokenService;
        private readonly AppDbContext _context;

        public UserController(
     IUserService userService,
     IWebHostEnvironment env,
     AppDbContext context,
     TokenService tokenService)
        {
            _userService = userService;
            _env = env;
            _tokenService = tokenService;
            _context = context;
        }



        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                // Step 1 — find user by email only (trim whitespace, case-insensitive)
                var emailTrimmed = dto.Email.Trim().ToLower();
                var user = await _context.Users
                    .SingleOrDefaultAsync(u => u.Email.ToLower() == emailTrimmed && !u.IsDeleted);

                if (user == null)
                    return Unauthorized(new { message = "No account found with that email." });

                // Step 2 — verify password
                bool passwordOk;
                if (user.Password.StartsWith("$2a$") || user.Password.StartsWith("$2b$"))
                {
                    // BCrypt hashed — verify normally
                    passwordOk = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
                }
                else
                {
                    // Plain text — compare directly then upgrade to BCrypt
                    passwordOk = user.Password == dto.Password;
                    if (passwordOk)
                    {
                        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                        await _context.SaveChangesAsync();
                    }
                }

                if (!passwordOk)
                    return Unauthorized(new { message = "Incorrect password." });

                // Step 3 — check active
                if (!user.IsActive)
                    return Unauthorized(new { message = "User account is inactive." });

                // Step 4 — get role
                var roleName = await _context.UserRoles
                    .Where(ur => ur.UserId == user.UserId)
                    .Select(ur => ur.Role!.RoleName)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrWhiteSpace(roleName))
                    return Unauthorized(new { message = "No role assigned to this user." });

                // Generate JWT
                var token = _tokenService.GenerateToken(
                    new UserDto
                    {
                        UserId = user.UserId,
                        FullName = user.FullName,
                        Email = user.Email,
                        RoleName = roleName
                    }
                );

                return Ok(new
                {
                    token = token,
                    userId = user.UserId,
                    fullName = user.FullName,
                    email = user.Email,
                    role = roleName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Something went wrong.",
                    error = ex.Message
                });
            }
        }


        // Admin only — full user list
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        // Admin, Faculty, Student — a user may fetch their own profile
        [Authorize(Roles = "Admin,Faculty,Student")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // Admin only — create users
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateUser(UserDto userDto)
        {
            var user = await _userService.CreateUser(userDto);
            return Ok(user);
        }

        // Admin only — update users
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserDto userDto)
        {
            var result = await _userService.UpdateUser(id, userDto);
            if (!result) return NotFound();
            return NoContent();
        }

        // Admin only — soft-delete users
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUser(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin,Faculty,Student")]
        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            // Ownership check — non-admin users can only update their own avatar
            var callerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin  = User.IsInRole("Admin");
            if (!isAdmin && callerId != id)
                return Forbid();

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
            await _userService.UpdateProfilePicture(id, relativePath);

            return Ok(new { url = relativePath });
        }
    }
}