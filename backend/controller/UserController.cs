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
            var loginResponse = await _userService.LoginAsync(dto);
            if (loginResponse == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(loginResponse);
        }

    }
}
