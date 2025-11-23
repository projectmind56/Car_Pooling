using backend.Context;
using backend.Dto;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using System.Text.Json;

namespace backend.Services
{
    public class DriveService : IDriveInterface
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public DriveService(AppDbContext context, IWebHostEnvironment env, IConfiguration configuration)
        {
            _context = context;
            _env = env;
            _configuration = configuration;
        }

        public async Task<bool> CreateDriveAsync(CreateDriveDto dto)
        {
            // Check if user has uploaded driver proof
            var hasDriverProof = await _context.DriverProofs.AnyAsync(dp => dp.UserId == dto.UserId);
            if (!hasDriverProof)
            {
                // User has no driver proof, return false or throw error
                // Here just returning false, you can change to throw exception if preferred
                return false;
            }

            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "CarUploads");

            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var photoPaths = new List<string>();

            foreach (var file in dto.CarPhotos)
            {
                var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadsDir, uniqueName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                photoPaths.Add($"/CarUploads/{uniqueName}");
            }

            var drive = new DriveModel
            {
                UserId = dto.UserId,
                From = dto.From,
                To = dto.To,
                Stops = string.Join(",", dto.Stops),
                DateTime = dto.DateTime,
                VehicleNumber = dto.VehicleNumber,
                CarModel = dto.CarModel,
                Capacity = dto.Capacity,
                CapacityLeft = dto.Capacity,
                LicenseNumber = dto.LicenseNumber,
                CarPhotoPaths = photoPaths
            };

            _context.Drives.Add(drive);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<DriveWithPassengersDto>> GetDrivesByUserIdAsync(int userId)
        {
            return await _context.Drives
                .Where(d => d.UserId == userId)
                .Select(d => new DriveWithPassengersDto
                {
                    DriveId = d.DriveId,
                    UserId = d.UserId,
                    From = d.From,
                    To = d.To,
                    Stops = d.Stops,
                    DateTime = d.DateTime,
                    VehicleNumber = d.VehicleNumber,
                    CarModel = d.CarModel,
                    Capacity = d.Capacity,
                    CapacityLeft = d.CapacityLeft,
                    LicenseNumber = d.LicenseNumber,
                    CarPhotoPaths = d.CarPhotoPaths,
                    Status = d.Status,

                    Passengers = _context.PassengerDetails
                        .Where(p => p.DriveId == d.DriveId)
                        .Select(p => new PassengerOutputDto
                        {
                            Id = p.Id,
                            UserId = p.UserId,
                            DriveId = p.DriveId,
                            Name = p.Name,
                            Age = p.Age,
                            Email = p.Email,
                            Phone = p.Phone,
                            AadharCopy = p.AadharCopy,
                            OTP = p.OTP,
                            Status = p.Status
                        }).ToList()
                })
                .ToListAsync();
        }
        public async Task<List<DriveWithProofDto>> GetDrivesAsync()
        {
            var drives = await (
                from drive in _context.Drives
                let proof = _context.DriverProofs
                    .Where(p => p.UserId == drive.UserId)
                    .OrderByDescending(p => p.Id)
                    .FirstOrDefault()

                where drive.DateTime > DateTime.Now
                      && (drive.Status == null
                          || drive.Status.Trim().ToLower() != "cancelled")

                select new DriveWithProofDto
                {
                    DriveId = drive.DriveId,
                    UserId = drive.UserId,
                    From = drive.From,
                    To = drive.To,
                    DateTime = drive.DateTime,
                    VehicleNumber = drive.VehicleNumber,
                    CarModel = drive.CarModel,
                    Capacity = drive.Capacity,
                    CapacityLeft = drive.CapacityLeft,
                    LicenseNumber = drive.LicenseNumber,
                    Status = drive.Status,
                    CarPhotoPaths = drive.CarPhotoPaths,

                    LicenseImagePath = proof.LicenseImagePath,
                    ProfileImagePath = proof.ProfileImagePath,
                    RcBookImagePath = proof.RcBookImagePath
                }
            ).ToListAsync();

            return drives;
        }

        public async Task<(bool Success, string Message)> UploadDriverProofAsync(DriverProofDto dto)
        {
            // Check if proof already exists
            var existingProof = await _context.DriverProofs
                .FirstOrDefaultAsync(p => p.UserId == dto.UserId);

            if (existingProof != null)
            {
                return (false, "Driver proof already created for this user.");
            }

            // File saving directory
            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "DriverProofs");

            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            // Helper to save a file
            string SaveFile(IFormFile file)
            {
                var uniqueName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadsDir, uniqueName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                return $"/DriverProofs/{uniqueName}";
            }

            // Save proof record
            var proof = new DriverProofModel
            {
                UserId = dto.UserId,
                LicenseImagePath = SaveFile(dto.LicenseImage),
                ProfileImagePath = SaveFile(dto.ProfileImage),
                RcBookImagePath = SaveFile(dto.RcBookImage)
            };

            _context.Add(proof);
            await _context.SaveChangesAsync();

            return (true, "Driver proof uploaded successfully.");
        }

        private string LoadEmailTemplate(string fileName)
        {
            var templatePath = Path.Combine(_env.WebRootPath ?? "wwwroot", "Templates", fileName);
            return File.ReadAllText(templatePath);
        }
        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtpSettings = _configuration.GetSection("Smtp");
            var fromEmail = smtpSettings["Username"];
            var fromPassword = smtpSettings["Password"];
            var smtpHost = smtpSettings["Host"];
            var smtpPort = int.Parse(smtpSettings["Port"]);

            using (var client = new SmtpClient(smtpHost, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(fromEmail, fromPassword);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }

        private async Task SendAppEmailAsync(string to, string subject, string templateFile, Dictionary<string, string> tokens)
        {
            string html = LoadEmailTemplate(templateFile);

            foreach (var t in tokens)
                html = html.Replace(t.Key, t.Value ?? "");

            await SendEmailAsync(to, subject, html);
        }
        public async Task<bool> AcceptPassengerAsync(int passengerId)
        {
            var passenger = await _context.PassengerDetails
                .FirstOrDefaultAsync(x => x.Id == passengerId);

            if (passenger == null)
                return false;

            passenger.Status = "accepted";
            await _context.SaveChangesAsync();

            // Email tokens
            var tokens = new Dictionary<string, string>
    {
        { "{Name}", passenger.Name },
        { "{DriverPhone}", "XXXXXXXXXX" } // optional
    };

            await SendAppEmailAsync(
                passenger.Email,
                "Your Ride is Accepted",
                "PassengerAccepted.html",
                tokens
            );

            return true;
        }
        public async Task<bool> RejectPassengerAsync(int passengerId)
        {
            var passenger = await _context.PassengerDetails
                .FirstOrDefaultAsync(x => x.Id == passengerId);

            if (passenger == null)
                return false;

            passenger.Status = "rejected";
            await _context.SaveChangesAsync();

            var tokens = new Dictionary<string, string>
    {
        { "{Name}", passenger.Name }
    };

            await SendAppEmailAsync(
                passenger.Email,
                "Your Ride is Rejected",
                "PassengerRejected.html",
                tokens
            );

            return true;
        }
        public async Task<bool> CancelDriveAsync(int driveId)
        {
            var drive = await _context.Drives
                .FirstOrDefaultAsync(x => x.DriveId == driveId);

            if (drive == null)
                return false;

            // Mark drive cancelled
            drive.Status = "cancelled";

            // Get all passengers of this drive
            var passengers = await _context.PassengerDetails
                .Where(p => p.DriveId == driveId)
                .ToListAsync();

            foreach (var p in passengers)
            {
                p.Status = "cancelled"; // update passenger status
            }

            await _context.SaveChangesAsync();

            // Send cancellation email to all passengers
            foreach (var p in passengers)
            {
                var tokens = new Dictionary<string, string>
        {
            { "{Name}", p.Name },
            { "{From}", drive.From },
            { "{To}", drive.To }
        };

                await SendAppEmailAsync(
                    p.Email,
                    "Your Ride Has Been Cancelled",
                    "DriveCancelledForPassenger.html",
                    tokens
                );
            }

            return true;
        }


        // 3️⃣ SHARE LOCATION
        public async Task<bool> ShareLocationAsync(int driveId)
        {
            var drive = await _context.Drives
                .FirstOrDefaultAsync(x => x.DriveId == driveId);

            if (drive == null)
                return false;

            // You can store a timestamp or share flag
            // drive.LastLocationSharedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

    }
}
