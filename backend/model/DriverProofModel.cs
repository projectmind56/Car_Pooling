using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DriverProofModel
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public string LicenseImagePath { get; set; } = string.Empty;

        public string ProfileImagePath { get; set; } = string.Empty;

        public string RcBookImagePath { get; set; } = string.Empty;
    }
}
