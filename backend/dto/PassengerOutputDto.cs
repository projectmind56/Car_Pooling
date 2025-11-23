namespace backend.DTOs
{
    public class PassengerOutputDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int DriveId { get; set; }
        public int OTP { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AadharCopy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
