using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class AuditLog
    {
        [Key]
        public Guid LogId { get; set; } = Guid.NewGuid();

        public Guid? UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Action { get; set; }

        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; }

        [Required]
        [MaxLength(50)]
        public string EntityId { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string Details { get; set; } // JSON

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
}
