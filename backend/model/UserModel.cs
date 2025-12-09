using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class UserModel
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string? UserName { get; set; }    // User's name

        [Required]
        [EmailAddress]
        public string? Email { get; set; }       // Email address

        [Required]
        public string? Password { get; set; }    // Password

        public string? Phone { get; set; }       // Phone number (optional)

        [Required]
        public string Role { get; set; } = "user"; // Default role is "user"

        public string Status { get; set; } = "active";
    }
}
