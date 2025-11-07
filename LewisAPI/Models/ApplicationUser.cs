using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace LewisAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        [Required]
        [MaxLength]
        public string Name { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLogin { get; set; }
        public byte[]? ProfilePicture { get; set; }
    }
}
