using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class UpdateOrderRequestDto
    {
        public OrderStatus? Status { get; set; }
        public string? Courier { get; set; }
        public string? TrackingNumber { get; set; }
        public DeliveryStatus DeliveryStatus { get; set; }
    }
}
