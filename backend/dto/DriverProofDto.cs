using Microsoft.AspNetCore.Http;

namespace backend.Dto
{
    public class DriverProofDto
    {
        public int UserId { get; set; }

        public IFormFile LicenseImage { get; set; }

        public IFormFile ProfileImage { get; set; }

        public IFormFile RcBookImage { get; set; }
    }
}