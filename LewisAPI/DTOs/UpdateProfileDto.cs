namespace LewisAPI.DTOs
{
    public class UpdateProfileDto
    {
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public byte[]? ProfilePicture { get; set; }

    }
}
