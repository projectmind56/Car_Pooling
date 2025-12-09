// Controllers/UserController.cs
using backend.Dto;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserInterface _userService;

        public UserController(IUserInterface userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var success = await _userService.RegisterAsync(dto);
            if (!success)
                return BadRequest(new { message = "User already exists." });

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var response = await _userService.LoginAsync(dto);

            if (response == null)
                return Unauthorized(new { message = "Invalid email or password." });

            if (response.Token == null && response.Message != null)
                return Unauthorized(new { message = response.Message });

            return Ok(response);
        }


        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();

            if (users == null)
                return NotFound(new { message = "No users found." });

            return Ok(users);
        }

        [HttpPut("update-status/{userId}")]
        public async Task<IActionResult> UpdateUserStatus(int userId)
        {
            var updated = await _userService.UpdateUserStatusAsync(userId);

            if (!updated)
                return NotFound(new { message = "User not found." });

            return Ok(new { message = $"Status updated successfully" });
        }


    }
}
