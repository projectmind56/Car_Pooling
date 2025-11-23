using backend.Models;

public class RideWithPassengerDto
{
    public DriveModel Ride { get; set; }
    public PassengerModel PassengerDetails { get; set; }

    // Driver details
    public string DriverName { get; set; }
    public string DriverEmail { get; set; }
    public string DriverPhone { get; set; }
}
