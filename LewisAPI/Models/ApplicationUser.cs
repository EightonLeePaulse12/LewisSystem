using Microsoft.AspNetCore.Identity;

namespace LewisAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public byte[]? ProfilePicture { get; set; }
    }
}
