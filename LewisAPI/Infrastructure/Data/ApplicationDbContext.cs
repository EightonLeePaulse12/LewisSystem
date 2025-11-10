using LewisAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LewisAPI.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
    {
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<CreditAgreement> CreditAgreements { get; set; }
        public DbSet<Installment> Installments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<StoreSettings> StoreSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Soft delete filter for Products
            builder
                .Entity<Product>()
                .HasMany(p => p.InventoryTransactions)
                .WithOne(it => it.Product)
                .HasForeignKey(it => it.ProductId)
                .IsRequired(false); // Makes it optional

            // Similarly for OrderItems
            builder
                .Entity<Product>()
                .HasMany(p => p.OrderItems)
                .WithOne(oi => oi.Product)
                .HasForeignKey(oi => oi.ProductId)
                .IsRequired(false);

            // Indexes for Product
            builder.Entity<Product>().HasIndex(p => p.Name);

            builder.Entity<Product>().HasIndex(p => p.SKU).IsUnique();

            builder.Entity<Product>().HasIndex(p => p.CategoryId);

            // Indexes for AuditLog
            builder.Entity<AuditLog>().HasIndex(al => al.Timestamp);

            builder.Entity<AuditLog>().HasIndex(al => al.EntityType);

            // One-to-one for Order-Delivery
            builder
                .Entity<Delivery>()
                .HasOne(d => d.Order)
                .WithOne(o => o.Delivery)
                .HasForeignKey<Delivery>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-one for Order-CreditAgreement
            builder
                .Entity<CreditAgreement>()
                .HasOne(ca => ca.Order)
                .WithOne(o => o.CreditAgreement)
                .HasForeignKey<CreditAgreement>(ca => ca.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Decimal precision configurations
            // For Product
            builder.Entity<Product>().Property(p => p.UnitPrice).HasPrecision(18, 2);
            builder.Entity<Product>().Property(p => p.CostPrice).HasPrecision(18, 2);

            // For Order
            builder.Entity<Order>().Property(o => o.SubTotal).HasPrecision(18, 2);
            builder.Entity<Order>().Property(o => o.DeliveryFee).HasPrecision(18, 2);
            builder.Entity<Order>().Property(o => o.Tax).HasPrecision(18, 2);
            builder.Entity<Order>().Property(o => o.Total).HasPrecision(18, 2);

            // For OrderItem
            builder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            builder.Entity<OrderItem>().Property(oi => oi.LineTotal).HasPrecision(18, 2);

            // For CreditAgreement
            builder.Entity<CreditAgreement>().Property(ca => ca.Principal).HasPrecision(18, 2);
            builder.Entity<CreditAgreement>().Property(ca => ca.InterestRate).HasPrecision(18, 2);
            builder
                .Entity<CreditAgreement>()
                .Property(ca => ca.OutstandingBalance)
                .HasPrecision(18, 2);

            // For Installment
            builder.Entity<Installment>().Property(i => i.AmountDue).HasPrecision(18, 2);
            builder.Entity<Installment>().Property(i => i.PrincipalComponent).HasPrecision(18, 2);
            builder.Entity<Installment>().Property(i => i.InterestComponent).HasPrecision(18, 2);
            builder.Entity<Installment>().Property(i => i.AmountPaid).HasPrecision(18, 2);

            // For Payment
            builder.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2);

            // For Delivery
            builder.Entity<Delivery>().Property(d => d.Fee).HasPrecision(18, 2);

            // Additional indexes if needed (e.g., for frequent queries)
            builder.Entity<Order>().HasIndex(o => o.OrderDate);

            builder.Entity<Order>().HasIndex(o => o.CustomerId);

            builder.Entity<CreditAgreement>().HasIndex(ca => ca.OrderId).IsUnique(); // Since one-to-one

            builder.Entity<Installment>().HasIndex(i => i.AgreementId);

            builder.Entity<Payment>().HasIndex(p => p.OrderId);

            builder.Entity<Payment>().HasIndex(p => p.AgreementId);

            builder.Entity<InventoryTransaction>().HasIndex(it => it.ProductId);

            builder.Entity<InventoryTransaction>().HasIndex(it => it.PerformedAt);

            // For Customer (one-to-one with ApplicationUser)
            builder
                .Entity<Customer>()
                .HasOne(c => c.User)
                .WithOne()
                .HasForeignKey<Customer>(c => c.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<StoreSettings>().HasKey(s => s.Id);
            builder.Entity<StoreSettings>().Property(s => s.DeliveryOptions).HasColumnType("jsonb");

            builder
                .Entity<StoreSettings>()
                .HasData(
                    new StoreSettings
                    {
                        Id = 1,
                        DefaultInterestRate = 0.10m,
                        SetupFee = 50.00m,
                        DeliveryOptions = new Dictionary<string, decimal>
                        {
                            { "Local", 10.00m },
                            { "Regional", 50.00m },
                            { "National", 100.00m },
                        },
                        BillingCycleStart = "NextMonth",
                        GracePeriodDays = 0,
                        LateFeePercentage = 0.05m,
                        DefaultPlanType = "Amortized",
                    }
                );
        }

        // Enum conversions if needed (Postgres handles enums as int by default, but for string storage if preferred)
        //Example: modelBuilder.Entity<Product>().Property(p => p.Status).HasConversion<string>();
        // But keeping as int for efficiency.

        // Add any seed data if desired, e.g., categories
        // modelBuilder.Entity<Category>().HasData(new Category { Id = 1, Name = "Furniture" });
    }
}
