using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Student_Management_System.DTO;

namespace JWTDemo.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(UserDto user)
        {
            // =====================================================
            // JWT Claims
            // =====================================================

            var claims = new List<Claim>
            {
                // User ID
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.UserId.ToString()
                ),

                // Email
                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),

                // Full Name
                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                ),

                // Unique Token ID
                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString()
                )
            };


            // =====================================================
            // Role Claim
            // =====================================================

            if (!string.IsNullOrWhiteSpace(user.RoleName))
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        user.RoleName
                    )
                );
            }


            // =====================================================
            // JWT Secret Key
            // =====================================================

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _config["Jwt:Key"]!
                )
            );


            // =====================================================
            // Signing Credentials
            // =====================================================

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );


            // =====================================================
            // Create JWT
            // =====================================================

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(
                        _config["Jwt:ExpiresInMinutes"]!
                    )
                ),
                signingCredentials: credentials
            );


            // =====================================================
            // Return Token
            // =====================================================

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}