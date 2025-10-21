using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.Dto
{
    public class CreateDriveDto
    {
        public int UserId { get; set; }
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public List<string> Stops { get; set; } = new();
        public DateTime DateTime { get; set; }

        public string VehicleNumber { get; set; } = string.Empty;
        public string CarModel { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int CapacityLeft { get; set; }

        public string LicenseNumber { get; set; } = string.Empty;

        public List<IFormFile> CarPhotos { get; set; } = new();
    }
}
