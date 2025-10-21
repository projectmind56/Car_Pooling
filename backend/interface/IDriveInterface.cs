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

        Task<bool> UploadDriverProofAsync(DriverProofDto dto);

    }
}
