using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IPassengerInterface
    {
        Task<string> CreatePassengersAsync(PassengerDto dto);
        Task<IEnumerable<PassengerModel>> GetAllPassengersAsync();
        Task<PassengerModel?> GetPassengerByIdAsync(int id);
        Task<bool> DeletePassengerAsync(int id);
    }
}
