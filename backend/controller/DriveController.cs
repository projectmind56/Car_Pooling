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

        // CREATE DRIVE
        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateDrive([FromForm] CreateDriveDto dto)
        {
            var success = await _service.CreateDriveAsync(dto);
            if (!success)
                return BadRequest(new { message = "Drive creation failed. May be Upload your proofs" });

            return Ok(new { message = "Drive created successfully." });
        }

        // GET DRIVES FOR A USER
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetDrivesByUserId(int userId)
        {
            var drives = await _service.GetDrivesByUserIdAsync(userId);
            if (drives == null || !drives.Any())
                return NotFound(new { message = "No drives found for this user." });

            return Ok(drives);
        }

        // GET ALL DRIVES
        [HttpGet("drives")]
        public async Task<IActionResult> GetDrives()
        {
            var drives = await _service.GetDrivesAsync();
            if (drives == null || !drives.Any())
                return NotFound(new { message = "No drives found." });

            return Ok(drives);
        }

        // UPLOAD DRIVER PROOF
        [HttpPost("upload-driver-proof")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadDriverProof([FromForm] DriverProofDto dto)
        {
            var (success, message) = await _service.UploadDriverProofAsync(dto);

            if (!success)
                return BadRequest(new { error = message });

            return Ok(new { message });
        }

        // ===================== NEW APIS =========================== //

        // 1️⃣ ACCEPT PASSENGER
        [HttpPost("accept-passenger/{passengerId}")]
        public async Task<IActionResult> AcceptPassenger(int passengerId)
        {
            var result = await _service.AcceptPassengerAsync(passengerId);
            if (!result)
                return BadRequest(new { message = "Failed to accept passenger." });

            return Ok(new { message = "Passenger accepted successfully." });
        }

        // 2️⃣ REJECT PASSENGER
        [HttpPost("reject-passenger/{passengerId}")]
        public async Task<IActionResult> RejectPassenger(int passengerId)
        {
            var result = await _service.RejectPassengerAsync(passengerId);
            if (!result)
                return BadRequest(new { message = "Failed to reject passenger." });

            return Ok(new { message = "Passenger rejected successfully." });
        }

        // 3️⃣ SHARE LOCATION
        [HttpPost("share-location/{driveId}")]
        public async Task<IActionResult> ShareLocation(int driveId)
        {
            var result = await _service.ShareLocationAsync(driveId);
            if (!result)
                return BadRequest(new { message = "Failed to share location." });

            return Ok(new { message = "Location shared successfully." });
        }

        // 4️⃣ CANCEL DRIVE
        [HttpPost("cancel-drive/{driveId}")]
        public async Task<IActionResult> CancelDrive(int driveId)
        {
            var result = await _service.CancelDriveAsync(driveId);
            if (!result)
                return BadRequest(new { message = "Failed to cancel drive." });

            return Ok(new { message = "Drive cancelled successfully." });
        }
    }
}
