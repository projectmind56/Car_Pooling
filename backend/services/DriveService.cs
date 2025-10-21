using backend.Context;
using backend.Dto;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services
{
    public class DriveService : IDriveInterface
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DriveService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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
                            OTP = p.OTP
                        }).ToList()
                })
                .ToListAsync();
        }
        public async Task<List<DriveWithProofDto>> GetDrivesAsync()
        {
            var drives = await (from drive in _context.Drives
                                join proof in _context.DriverProofs
                                on drive.UserId equals proof.UserId
                                where drive.DateTime > DateTime.Now
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

                                    CarPhotoPaths = drive.CarPhotoPaths,

                                    LicenseImagePath = proof.LicenseImagePath,
                                    ProfileImagePath = proof.ProfileImagePath,
                                    RcBookImagePath = proof.RcBookImagePath
                                }).ToListAsync();

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

    }
}
