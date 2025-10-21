using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Context;
using System.Net;
using System.Net.Mail;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class PassengerService : IPassengerInterface
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public PassengerService(AppDbContext context, IWebHostEnvironment env, IConfiguration configuration)
        {
            _context = context;
            _env = env;
            _configuration = configuration;
        }

        private string SaveBase64Image(string base64Image, string folderPath)
        {
            var fileName = $"{Guid.NewGuid()}.jpg";
            var filePath = Path.Combine(folderPath, fileName);

            if (base64Image.Contains(","))
                base64Image = base64Image.Split(',')[1];

            var imageBytes = Convert.FromBase64String(base64Image);
            File.WriteAllBytes(filePath, imageBytes);

            return $"/AadharPhotos/{fileName}";
        }

        private string GeneratePassengerEmailHtml(PassengerModel passenger, UserModel driver)
        {
            var templatePath = Path.Combine(_env.WebRootPath ?? "wwwroot", "Templates", "PassengerEmailTemplate.html");
            string html = File.ReadAllText(templatePath);

            html = html.Replace("{PassengerName}", passenger.Name)
                       .Replace("{PassengerAge}", passenger.Age.ToString())
                       .Replace("{PassengerEmail}", passenger.Email)
                       .Replace("{PassengerPhone}", passenger.Phone)
                       .Replace("{OTP}", passenger.OTP.ToString())
                       .Replace("{DriverName}", driver.UserName ?? "Driver")
                       .Replace("{DriverEmail}", driver.Email ?? "")
                       .Replace("{DriverPhone}", driver.Phone ?? "");

            return html;
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

        public async Task<string> CreatePassengersAsync(PassengerDto dto)
        {
            bool allSuccess = true;

            var aadharUploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "AadharPhotos");

            if (!Directory.Exists(aadharUploadsDir))
                Directory.CreateDirectory(aadharUploadsDir);

            var groupedByDrive = dto.Passengers
                .GroupBy(p => p.DriveId)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var entry in groupedByDrive)
            {
                int driveId = entry.Key;
                List<PassengerItemDto> passengersForDrive = entry.Value;

                var drive = await _context.Drives.FirstOrDefaultAsync(d => d.DriveId == driveId);
                if (drive == null)
                {
                    allSuccess = false;
                    continue;
                }

                if (drive.CapacityLeft < passengersForDrive.Count)
                {
                    allSuccess = false;
                    continue;
                }

                var driverUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == drive.UserId);
                if (driverUser == null)
                {
                    allSuccess = false;
                    continue;
                }

                foreach (var passengerDto in passengersForDrive)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == passengerDto.UserId);
                    if (user == null)
                    {
                        allSuccess = false;
                        continue;
                    }

                    string aadharPath = SaveBase64Image(passengerDto.Aadhar, aadharUploadsDir);

                    int otp = new Random().Next(100000, 999999);

                    var passenger = new PassengerModel
                    {
                        UserId = passengerDto.UserId,
                        DriveId = passengerDto.DriveId,
                        Name = passengerDto.Name,
                        Age = passengerDto.Age,
                        Email = passengerDto.Email,
                        Phone = passengerDto.Phone,
                        AadharCopy = aadharPath,
                        OTP = otp
                    };

                    _context.PassengerDetails.Add(passenger);

                    string htmlBody = GeneratePassengerEmailHtml(passenger, driverUser);
                    await SendEmailAsync(passenger.Email, "Your Ride Details and OTP", htmlBody);
                }

                drive.CapacityLeft -= passengersForDrive.Count;
            }

            await _context.SaveChangesAsync();

            return allSuccess
                ? "Successfully booked"
                : "Some passengers failed to book due to invalid UserId, DriveId, or insufficient capacity.";
        }

        public async Task<IEnumerable<PassengerModel>> GetAllPassengersAsync()
        {
            return await _context.PassengerDetails.ToListAsync();
        }

        public async Task<PassengerModel?> GetPassengerByIdAsync(int id)
        {
            return await _context.PassengerDetails.FindAsync(id);
        }

        public async Task<bool> DeletePassengerAsync(int id)
        {
            var passenger = await _context.PassengerDetails.FindAsync(id);
            if (passenger == null)
                return false;

            _context.PassengerDetails.Remove(passenger);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
