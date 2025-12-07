using System;

namespace backend.Models
{
    public class Feedback
    {
        public int Id { get; set; }

        public int DriverId { get; set; }
        public int DriveId { get; set; }

        public int PassengerId { get; set; }

        public int Rating { get; set; }      // 1 to 5 stars
        public string FeedbackText { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
