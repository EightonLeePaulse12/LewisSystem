using LewisAPI.Models;

namespace LewisAPI.DTOs
{
    public class OrderDto
    {
        public Guid OrderId { get; set; }
        public Guid CustomerId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public PaymentType PaymentType { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItemDto> OrderItems { get; set; }
        public CreditAgreementDto? CreditAgreement { get; set; }
        public DeliveryDto? Delivery { get; set; }
        public List<PaymentDto>? Payments { get; set; }
    }
}
