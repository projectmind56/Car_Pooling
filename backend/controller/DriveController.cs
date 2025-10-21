using backend.Dto;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriveController : ControllerBase
    {
        private readonly IDriveInterface _service;

        public DriveController(IDriveInterface service)
        {
            _service = service;
        }

        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateDrive([FromForm] CreateDriveDto dto)
        {
            var success = await _service.CreateDriveAsync(dto);
            if (!success)
                return BadRequest(new { message = "Drive creation failed. May be Upload your proofs" });

            return Ok(new { message = "Drive created successfully." });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetDrivesByUserId(int userId)
        {
            var drives = await _service.GetDrivesByUserIdAsync(userId);
            if (drives == null || !drives.Any())
                return NotFound(new { message = "No drives found for this user." });

            return Ok(drives);
        }

        [HttpGet("drives")]
        public async Task<IActionResult> GetDrives()
        {
            var drives = await _service.GetDrivesAsync();
            if (drives == null || !drives.Any())
                return NotFound(new { message = "No drives found for this data." });

            return Ok(drives);
        }

        [HttpPost("upload-driver-proof")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadDriverProof([FromForm] DriverProofDto dto)
        {
            var success = await _service.UploadDriverProofAsync(dto);
            if (!success)
                return BadRequest(new { message = "Driver proof upload failed." });

            return Ok(new { message = "Driver proof uploaded successfully." });
        }

    }
}
