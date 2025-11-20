namespace LewisAPI.DTOs
{
    public class PaymentDto
    {
        public Guid PaymentId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? AgreementId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Method { get; set; }
        public string Reference { get; set; }
        public Guid? ReceivedBy { get; set; }
        public string? Email { get; internal set; }
    }
}
