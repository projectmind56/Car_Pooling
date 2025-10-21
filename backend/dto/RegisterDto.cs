// Dto/RegisterDto.cs
namespace backend.Dto
{
    public class RegisterDto
    {
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Phone { get; set; }
    }
}
