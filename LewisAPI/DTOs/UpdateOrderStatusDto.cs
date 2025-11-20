using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus NewStatus { get; set; }
    }
}
