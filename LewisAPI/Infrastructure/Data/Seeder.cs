namespace LewisAPI.Infrastructure.Data
{
    using Bogus;
    using LewisAPI.Models;
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    public class Seeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            // Ensure database is created/migrated before seeding
            context.Database.Migrate();

            // Seed Categories (5 categories)
            if (!context.Categories.Any())
            {
                var categoryFaker = new Faker<Category>()
                    .RuleFor(c => c.Id, f => f.Random.Int(1, 1000))
                    .RuleFor(c => c.Name, f => f.Commerce.Department());

                var categories = categoryFaker.Generate(5);
                context.Categories.AddRange(categories);
                context.SaveChanges();
            }

            // Seed Products (10 products, with variety in dates via created implicitly, but stock/status vary)
            if (!context.Products.Any())
            {
                var categories = context.Categories.ToList();
                var productFaker = new Faker<Product>()
                    .RuleFor(p => p.ProductId, f => Guid.NewGuid())
                    .RuleFor(p => p.SKU, f => f.Commerce.Ean13())
                    .RuleFor(p => p.Name, f => f.Commerce.ProductName())
                    .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
                    .RuleFor(p => p.CategoryId, f => f.PickRandom(categories).Id)
                    .RuleFor(p => p.UnitPrice, f => f.Finance.Amount(10, 1000, 2))
                    .RuleFor(p => p.CostPrice, (f, p) => f.Finance.Amount(5, p.UnitPrice - 1, 2))
                    .RuleFor(p => p.Weight, f => f.Random.Decimal(0.1m, 50m))
                    .RuleFor(p => p.Dimensions, f => $"{f.Random.Int(1, 100)}x{f.Random.Int(1, 100)}x{f.Random.Int(1, 100)}")
                    .RuleFor(p => p.StockQty, f => f.Random.Int(0, 500))
                    .RuleFor(p => p.ReorderThreshold, f => f.Random.Int(10, 50))
                    .RuleFor(p => p.Status, f => f.PickRandom<ProductStatus>())
                    .RuleFor(p => p.ImageUrl, f => Encoding.UTF8.GetBytes(f.Image.PicsumUrl())) // Dummy byte[] from string URL
                    .RuleFor(p => p.IsDeleted, f => f.Random.Bool(0.1f));

                var products = productFaker.Generate(10);
                context.Products.AddRange(products);
                context.SaveChanges();
            }

            // Use the provided real User/Customer GUIDs
            var customerIds = Guid.Parse("019aa557-6f82-72d6-8c79-ad07b17cc56e"); // Customer role user Id

            // Seed Orders (10 orders, with dates from 6 months ago to now, using real customer IDs)
            if (!context.Orders.Any())
            {
                var orderFaker = new Faker<Order>()
                    .RuleFor(o => o.OrderId, f => Guid.NewGuid())
                    .RuleFor(o => o.CustomerId, f => f.PickRandom(customerIds))
                    .RuleFor(o => o.OrderDate, f => f.Date.Past(6).ToUniversalTime()) // Up to 6 months ago
                    .RuleFor(o => o.SubTotal, f => f.Finance.Amount(50, 5000, 2))
                    .RuleFor(o => o.DeliveryFee, f => f.Finance.Amount(5, 50, 2))
                    .RuleFor(o => o.Tax, (f, o) => Math.Round(o.SubTotal * 0.1m, 2))
                    .RuleFor(o => o.Total, (f, o) => o.SubTotal + o.DeliveryFee + o.Tax)
                    .RuleFor(o => o.PaymentType, f => f.PickRandom<PaymentType>())
                    .RuleFor(o => o.Status, f => f.PickRandom<OrderStatus>());

                var orders = orderFaker.Generate(10);
                context.Orders.AddRange(orders);
                context.SaveChanges();
            }

            // Seed OrderItems (20 items, linked to orders and products)
            if (!context.OrderItems.Any())
            {
                var orders = context.Orders.ToList();
                var products = context.Products.ToList();
                var orderItemFaker = new Faker<OrderItem>()
                    .RuleFor(oi => oi.OrderItemId, f => Guid.NewGuid())
                    .RuleFor(oi => oi.OrderId, f => f.PickRandom(orders).OrderId)
                    .RuleFor(oi => oi.ProductId, f => f.PickRandom(products).ProductId)
                    .RuleFor(oi => oi.Quantity, f => f.Random.Int(1, 10))
                    .RuleFor(oi => oi.UnitPrice, (f, oi) => context.Products.Find(oi.ProductId)?.UnitPrice ?? 0)
                    .RuleFor(oi => oi.LineTotal, (f, oi) => oi.Quantity * oi.UnitPrice);

                var orderItems = orderItemFaker.Generate(20);
                context.OrderItems.AddRange(orderItems);
                context.SaveChanges();
            }

            // Seed Deliveries (5 deliveries, linked to some orders)
            if (!context.Deliveries.Any())
            {
                var orders = context.Orders.ToList();
                var deliveryFaker = new Faker<Delivery>()
                    .RuleFor(d => d.DeliveryId, f => Guid.NewGuid())
                    .RuleFor(d => d.OrderId, f => f.PickRandom(orders).OrderId)
                    .RuleFor(d => d.Courier, f => f.PickRandom(new[] { "UPS", "FedEx", "DHL", "USPS" }))
                    .RuleFor(d => d.TrackingNumber, f => f.Random.AlphaNumeric(12))
                    .RuleFor(d => d.Fee, f => f.Finance.Amount(5, 20, 2))
                    .RuleFor(d => d.EstimatedDeliveryDate, (f, d) => context.Orders.Find(d.OrderId)?.OrderDate.AddDays(f.Random.Int(1, 7)).ToUniversalTime() ?? DateTime.UtcNow)
                    .RuleFor(d => d.Status, f => f.PickRandom<DeliveryStatus>());

                var deliveries = deliveryFaker.Generate(5);
                context.Deliveries.AddRange(deliveries);
                context.SaveChanges();
            }

            // Seed CreditAgreements (5 agreements, linked to some orders)
            if (!context.CreditAgreements.Any())
            {
                var orders = context.Orders.ToList();
                var creditFaker = new Faker<CreditAgreement>()
                    .RuleFor(ca => ca.AgreementId, f => Guid.NewGuid())
                    .RuleFor(ca => ca.OrderId, f => f.PickRandom(orders).OrderId)
                    .RuleFor(ca => ca.Principal, (f, ca) => context.Orders.Find(ca.OrderId)?.Total ?? 0)
                    .RuleFor(ca => ca.InterestRate, f => f.Finance.Amount(0.05m, 0.15m, 2))
                    .RuleFor(ca => ca.TermMonths, f => f.Random.Int(3, 12))
                    .RuleFor(ca => ca.StartDate,
                        (f, ca) => (context.Orders.Find(ca.OrderId)?.OrderDate ?? DateTime.UtcNow).ToUniversalTime())

                    .RuleFor(ca => ca.NextDueDate, (f, ca) => ca.StartDate.AddMonths(1).ToUniversalTime())
                    .RuleFor(ca => ca.OutstandingBalance, (f, ca) => ca.Principal)
                    .RuleFor(ca => ca.Status, f => f.PickRandom<CreditAgreementStatus>())
                    .RuleFor(ca => ca.PlanType, f => f.PickRandom<CreditPlanType>());

                var credits = creditFaker.Generate(5);
                context.CreditAgreements.AddRange(credits);
                context.SaveChanges();
            }

            // Seed Installments (15 installments, linked to agreements)
            if (!context.Installments.Any())
            {
                var agreements = context.CreditAgreements.ToList();
                foreach (var agreement in agreements)
                {
                    var installmentFaker = new Faker<Installment>()
                        .RuleFor(i => i.InstallmentId, f => Guid.NewGuid())
                        .RuleFor(i => i.AgreementId, agreement.AgreementId)
                        .RuleFor(i => i.DueDate, (f, i) => agreement.StartDate.AddMonths(f.IndexFaker + 1).ToUniversalTime())
                        .RuleFor(i => i.AmountDue, f => Math.Round(agreement.Principal / agreement.TermMonths + f.Random.Decimal(10, 50), 2))
                        .RuleFor(i => i.PrincipalComponent, (f, i) => Math.Round(i.AmountDue * 0.8m, 2))
                        .RuleFor(i => i.InterestComponent, (f, i) => i.AmountDue - i.PrincipalComponent)
                        .RuleFor(i => i.AmountPaid, (f, i) => f.Random.Bool() ? i.AmountDue : 0)
                        .RuleFor(i => i.PaidDate, (f, i) =>
                            i.AmountPaid > 0
                                ? i.DueDate.AddDays(-f.Random.Int(1, 5)).ToUniversalTime()
                                : null)
                        .RuleFor(i => i.Status, f => f.PickRandom<InstallmentStatus>());

                    var installments = installmentFaker.Generate(agreement.TermMonths);
                    context.Installments.AddRange(installments);
                }
                context.SaveChanges();
            }

            // Seed Payments (10 payments, linked to orders or agreements, using real user IDs for ReceivedBy)
            if (!context.Payments.Any())
            {
                var orders = context.Orders.ToList();
                var agreements = context.CreditAgreements.ToList();
                var paymentFaker = new Faker<Payment>()
                    .RuleFor(p => p.PaymentId, f => Guid.NewGuid())
                    .RuleFor(p => p.OrderId, f => f.Random.Bool() ? f.PickRandom(orders).OrderId : (Guid?)null)
                    .RuleFor(p => p.AgreementId, f => f.Random.Bool() ? f.PickRandom(agreements).AgreementId : (Guid?)null)
                    .RuleFor(p => p.Amount, f => f.Finance.Amount(10, 1000, 2))
                    .RuleFor(p => p.PaymentDate, f => f.Date.Past(6).ToUniversalTime())
                    .RuleFor(p => p.Method, f => f.PickRandom("Credit, Cash"))
                    .RuleFor(p => p.Reference, f => f.Random.AlphaNumeric(10))
                    .RuleFor(p => p.ReceivedBy, f => customerIds); // Use real IDs

                var payments = paymentFaker.Generate(10);
                context.Payments.AddRange(payments);
                context.SaveChanges();
            }

            // Seed InventoryTransactions (15 transactions, linked to products, with past dates, using real user IDs for PerformedBy)
            if (!context.InventoryTransactions.Any())
            {
                var products = context.Products.ToList();
                var transactionFaker = new Faker<InventoryTransaction>()
                    .RuleFor(it => it.TransactionId, f => Guid.NewGuid())
                    .RuleFor(it => it.ProductId, f => f.PickRandom(products).ProductId)
                    .RuleFor(it => it.ChangeQty, f => f.Random.Int(-50, 100))
                    .RuleFor(it => it.Type, f => f.PickRandom<InventoryTransactionType>())
                    .RuleFor(it => it.Note, f => f.Lorem.Sentence())
                    .RuleFor(it => it.PerformedBy, f => f.PickRandom(customerIds)) // Use real IDs
                    .RuleFor(it => it.PerformedAt, f => f.Date.Past(6).ToUniversalTime());

                var transactions = transactionFaker.Generate(15);
                context.InventoryTransactions.AddRange(transactions);
                context.SaveChanges();
            }

            // Seed AuditLogs (20 logs, with variety in timestamps, using real user IDs)
            if (!context.AuditLogs.Any())
            {
                var auditFaker = new Faker<AuditLog>()
                    .RuleFor(al => al.LogId, f => Guid.NewGuid())
                    .RuleFor(al => al.UserId, f => f.PickRandom(customerIds))
                    .RuleFor(al => al.Action, f => f.PickRandom(new[] { "Create", "Update", "Delete", "Login" }))
                    .RuleFor(al => al.EntityType, f => f.PickRandom(new[] { "Product", "Order", "User" }))
                    .RuleFor(al => al.EntityId, f => Guid.NewGuid().ToString())
                    .RuleFor(al => al.Timestamp, f => f.Date.Past(6).ToUniversalTime())
                    .RuleFor(al => al.Details, f => f.Lorem.Paragraph());

                var audits = auditFaker.Generate(20);
                context.AuditLogs.AddRange(audits);
                context.SaveChanges();
            }
        }
    }
}