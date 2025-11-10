namespace LewisAPI.DTOs
{
    public class PaymentDto
    {
        public decimal Amount { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? AgreementId { get; set; }
        public string? StripeToken { get; set; }
        public string? Method { get; set; } // Optional for manual
    }
}
