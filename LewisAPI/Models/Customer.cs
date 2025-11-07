using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LewisAPI.Models
{
    public class Customer
    {
        [Key]
        public Guid CustomerId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Address { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; }

        [Required]
        [MaxLength(20)]
        public string PostalCode { get; set; }

        [MaxLength(50)]
        public string? IDNumber { get; set; }

        [ForeignKey("CustomerId")]
        public virtual ApplicationUser User { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }
}
