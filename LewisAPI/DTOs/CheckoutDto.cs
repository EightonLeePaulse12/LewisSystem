using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class CheckoutDto
    {
        public PaymentType PaymentType { get; set; }
        public int? TermMonths { get; set; }
        public string DeliveryOption { get; set; } // e.g., "local", "regional"
        public decimal? Deposit { get; set; }
        public string? StripeToken { get; set; } // For cash or deposit
        public List<OrderItemDto> Items { get; set; } // From frontend cart
    }
}
