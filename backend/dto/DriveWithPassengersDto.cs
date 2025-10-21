using backend.DTOs;

public class DriveWithPassengersDto
{
    public int DriveId { get; set; }
    public int UserId { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Stops { get; set; } = string.Empty;
    public DateTime DateTime { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int CapacityLeft { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public List<string> CarPhotoPaths { get; set; } = new List<string>();

    public List<PassengerOutputDto> Passengers { get; set; } = new List<PassengerOutputDto>();
}
