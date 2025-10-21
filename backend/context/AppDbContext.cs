using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace backend.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<UserModel> Users { get; set; }
        public DbSet<DriveModel> Drives { get; set; }
        public DbSet<DriverProofModel> DriverProofs { get; set; }
        public DbSet<PassengerModel> PassengerDetails { get; set; }
    }
}