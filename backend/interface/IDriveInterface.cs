using backend.Dto;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IDriveInterface
    {
        Task<bool> CreateDriveAsync(CreateDriveDto dto);
        Task<List<DriveWithPassengersDto>> GetDrivesByUserIdAsync(int userId);
        Task<List<DriveWithProofDto>> GetDrivesAsync();
        Task<(bool Success, string Message)> UploadDriverProofAsync(DriverProofDto dto);
        Task<bool> AcceptPassengerAsync(int passengerId);
        Task<bool> RejectPassengerAsync(int passengerId);
        Task<bool> ShareLocationAsync(int driveId);
        Task<bool> CancelDriveAsync(int driveId);

    }
}
