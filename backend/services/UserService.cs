// Services/UserService.cs
using backend.Dto;
using backend.Interfaces;
using backend.Models;
using backend.Context;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Services
{
    public class UserService : IUserInterface
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == registerDto.Email);

            if (existingUser != null)
                return false;

            var user = new UserModel
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                Password = HashPassword(registerDto.Password),
                Phone = registerDto.Phone,
                Role = "user"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

    if (user == null || !VerifyPassword(loginDto.Password, user.Password))
        return null;

    var token = GenerateJwtToken(user);

    return new LoginResponseDto
    {
        Token = token,
        UserId = user.UserId
    };
}


        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }

        private string GenerateJwtToken(UserModel user)
        {
            var issuer = "https://www.EXAMPLE.com/";
            var audience = "CarPooling";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("tfgusjhabdfy-yuawzsdfji-iowjhekcf-fgyuhjkhgvtfgyuhb-5678fghj"));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Email, user.Email ?? ""),
        new Claim(ClaimTypes.Role, user.Role ?? "user"),
    };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
