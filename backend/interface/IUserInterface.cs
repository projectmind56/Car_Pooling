// Interfaces/IUserInterface.cs
using backend.Dto;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IUserInterface
    {
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);

        Task<List<UserModel>> GetAllUsers();
        Task<bool> UpdateUserStatusAsync(int userId);
    }
}
