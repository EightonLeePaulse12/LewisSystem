using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class DashboardDto
    {
        public List<ProductDto> LowStock { get; set; }
        public Dictionary<PaymentType, decimal> Sales { get; set; }
        public decimal OutstandingCredit { get; set; }
        public List<OrderDto> RecentOrders { get; set; }
    }
}
