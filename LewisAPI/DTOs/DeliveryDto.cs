using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class DeliveryDto
    {
        public Guid DeliveryId { get; set; }
        public string? Courier { get; set; }
        public string? TrackingNumber { get; set; }
        public decimal Fee { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DeliveryStatus Status { get; set; }
    }
}
