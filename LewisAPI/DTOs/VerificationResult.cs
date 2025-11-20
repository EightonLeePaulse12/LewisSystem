namespace LewisAPI.DTOs
{
    public class VerificationResult
    {
        public bool Success { get; set; }
        public decimal Amount { get; set; } // Optional, for amount verification
        public string Message { get; set; }
    }
}
