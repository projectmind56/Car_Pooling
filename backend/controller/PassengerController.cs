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
    }
}
