using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class PassengerModel
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public int DriveId { get; set; }
        public int OTP { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Range(5, 100, ErrorMessage = "Age must be between 0 and 120.")]
        public int Age { get; set; }

        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string AadharCopy { get; set; } = string.Empty;

        public string Status { get; set;} = "pending";

    }
}
