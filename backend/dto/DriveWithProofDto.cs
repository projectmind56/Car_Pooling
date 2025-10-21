public class DriveWithProofDto
{
    public int Id { get; set; }
    public int DriveId { get; set; }

    public int UserId { get; set; }
    public string From { get; set; }
    public string To { get; set; }
    public DateTime DateTime { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int CapacityLeft { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;

    public List<string> CarPhotoPaths { get; set; } = new List<string>();
    public string LicenseImagePath { get; set; }
    public string ProfileImagePath { get; set; }
    public string RcBookImagePath { get; set; }
}
