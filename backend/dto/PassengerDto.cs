namespace backend.DTOs
{
    public class PassengerDto
    {
        public List<PassengerItemDto> Passengers { get; set; } = new List<PassengerItemDto>();
    }

    public class PassengerItemDto
    {
        public int UserId { get; set; }
        public int DriveId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Aadhar { get; set; } = string.Empty;
        public int OTP { get; set; }

    }
}
