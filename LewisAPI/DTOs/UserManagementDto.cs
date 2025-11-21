namespace LewisAPI.DTOs
{
    public class UserManagementDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedDate { get; set; }
        public byte[] ProfilePicture { get; set; }
        public DateTime LastLogin { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public string UserRole { get; set; }
    }
}
