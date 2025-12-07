using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PassengerController : ControllerBase
    {
        private readonly IPassengerInterface _passengerService;

        public PassengerController(IPassengerInterface passengerService)
        {
            _passengerService = passengerService;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePassengers([FromBody] PassengerDto dto)
        {
            if (dto.Passengers == null || dto.Passengers.Count == 0)
                return BadRequest("Passenger list is empty.");

            var message = await _passengerService.CreatePassengersAsync(dto);
            return Ok(new { message });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPassengers()
        {
            var passengers = await _passengerService.GetAllPassengersAsync();
            return Ok(passengers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPassengerById(int id)
        {
            var passenger = await _passengerService.GetPassengerByIdAsync(id);
            if (passenger == null)
                return NotFound();

            return Ok(passenger);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePassenger(int id)
        {
            var deleted = await _passengerService.DeletePassengerAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
        [HttpGet("my-rides/{userId}")]
        public async Task<IActionResult> GetMyRides(int userId)
        {
            var rides = await _passengerService.GetRidesForPassengerAsync(userId);
            return Ok(rides);
        }

        // CANCEL RIDE
        [HttpPost("cancel-ride/{passengerId}")]
        public async Task<IActionResult> CancelRide(int passengerId)
        {
            var result = await _passengerService.CancelPassengerRideAsync(passengerId);

            if (!result)
                return BadRequest("Unable to cancel ride.");

            return Ok(new { message = "Ride cancelled successfully." });
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddFeedback([FromBody] FeedbackRequestDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var feedback = new Feedback
            {
                DriverId = dto.DriverId,
                PassengerId = dto.PassengerId,
                Rating = dto.Rating,
                FeedbackText = dto.Feedback,
                DriveId = dto.DriveId,
            };

            await _passengerService.AddFeedbackAsync(feedback);

            return Ok(new { message = "Feedback submitted successfully!" });
        }

        [HttpGet("driver/{driverId}")]
        public async Task<IActionResult> GetDriverFeedback(int driverId)
        {
            var feedbacks = await _passengerService.GetFeedbackByDriverIdAsync(driverId);
            return Ok(feedbacks);
        }

        [HttpGet("drive-feedback/{driveId}/{userId}")]
        public async Task<IActionResult> GetUsersFeedback(int driveId, int userId)
        {
            var feedbacks = await _passengerService.GetFeedbackByUserIdAsync(driveId, userId);
            return Ok(feedbacks);
        }

    }
}
