namespace LewisAPI.DTOs
{
    public class ConfirmResetDTO
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; } // For matching
    }
}
