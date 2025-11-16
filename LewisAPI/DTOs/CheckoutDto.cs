using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class CheckoutDto
    {
        public List<CheckoutItemDto> Items { get; set; }
        public string DeliveryOption { get; set; }
        public PaymentType PaymentType { get; set; } // Enum
        public int? TermMonths { get; set; }
        public BillingAddressDto BillingAddress { get; set; }
    }
}
