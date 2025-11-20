namespace LewisAPI.DTOs
{
    public class RegisterDTO
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string IDNumber { get; set; } // Optional
        public string Password { get; set; }
        public string ConfirmPassword { get; set; } // For validation
    }
}
