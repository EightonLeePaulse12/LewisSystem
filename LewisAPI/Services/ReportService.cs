using System.Globalization;
using CsvHelper;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Interfaces;
using LewisAPI.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LewisAPI.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GenerateSalesReportAsync(
            DateTime start,
            DateTime end,
            string format
        )
        {
            // Normalize to UTC
            var startUtc = DateTime.SpecifyKind(start.Date, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(end.Date.AddDays(1), DateTimeKind.Utc);

            var sales = await _context
                .Orders.Where(o => o.OrderDate >= startUtc && o.OrderDate < endUtc)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,
                    o.Total,
                    o.PaymentType,
                    o.Status,
                })
                .ToListAsync();

            if (format == "csv")
            {
                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                await csv.WriteRecordsAsync(sales);
                return memoryStream.ToArray();
            }
            else if (format == "pdf")
            {
                var document = Document.Create(doc =>
                {
                    doc.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.Content()
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Cell().Row(1).Column(1).Text("Order ID");
                                table.Cell().Row(1).Column(2).Text("Date");
                                table.Cell().Row(1).Column(3).Text("Total");
                                table.Cell().Row(1).Column(4).Text("Payment Type");
                                table.Cell().Row(1).Column(5).Text("Status");

                                uint row = 2;
                                foreach (var sale in sales)
                                {
                                    table.Cell().Row(row).Column(1).Text(sale.OrderId.ToString());
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(2)
                                        .Text(sale.OrderDate.ToShortDateString());
                                    table.Cell().Row(row).Column(3).Text(sale.Total.ToString("C"));
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(4)
                                        .Text(sale.PaymentType.ToString());
                                    table.Cell().Row(row).Column(5).Text(sale.Status.ToString());
                                    row++;
                                }
                            });
                    });
                });
                return document.GeneratePdf();
            }
            throw new NotSupportedException("Format not supported.");
        }

        public async Task<byte[]> GeneratePaymentsReportAsync(
            DateTime start,
            DateTime end,
            string format
        )
        {
            // Normalize to UTC
            var startUtc = DateTime.SpecifyKind(start.Date, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(end.Date.AddDays(1), DateTimeKind.Utc);

            var payments = await _context
                .Payments.Where(p => p.PaymentDate >= startUtc && p.PaymentDate < endUtc)
                .Select(p => new
                {
                    p.PaymentId,
                    p.PaymentDate,
                    p.Amount,
                    p.Method,
                    OrderId = p.OrderId ?? Guid.Empty,
                    AgreementId = p.AgreementId ?? Guid.Empty,
                })
                .ToListAsync();

            if (format == "csv")
            {
                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                await csv.WriteRecordsAsync(payments);
                return memoryStream.ToArray();
            }
            else if (format == "pdf")
            {
                var document = Document.Create(doc =>
                {
                    doc.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.Content()
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Cell().Row(1).Column(1).Text("Payment ID");
                                table.Cell().Row(1).Column(2).Text("Date");
                                table.Cell().Row(1).Column(3).Text("Amount");
                                table.Cell().Row(1).Column(4).Text("Method");
                                table.Cell().Row(1).Column(5).Text("Reference");

                                uint row = 2;
                                foreach (var payment in payments)
                                {
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(1)
                                        .Text(payment.PaymentId.ToString());
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(2)
                                        .Text(payment.PaymentDate.ToShortDateString());
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(3)
                                        .Text(payment.Amount.ToString("C"));
                                    table.Cell().Row(row).Column(4).Text(payment.Method);
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(5)
                                        .Text(payment.AgreementId.ToString() ?? "N/A");
                                    row++;
                                }
                            });
                    });
                });
                return document.GeneratePdf();
            }
            throw new NotSupportedException("Format not supported.");
        }

        public async Task<byte[]> GenerateOverdueReportAsync(string format)
        {
            var overdue = await _context
                .Installments.Where(i =>
                    i.DueDate < DateTime.UtcNow && i.Status == InstallmentStatus.Pending
                )
                .Select(i => new
                {
                    i.InstallmentId,
                    i.DueDate,
                    i.AmountDue,
                    i.AgreementId,
                    CustomerName = i.Agreement.Order.CustomerId,
                })
                .ToListAsync();

            if (format == "csv")
            {
                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                await csv.WriteRecordsAsync(overdue);
                return memoryStream.ToArray();
            }
            else if (format == "pdf")
            {
                var document = Document.Create(doc =>
                {
                    doc.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.Content()
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Cell().Row(1).Column(1).Text("Installment ID");
                                table.Cell().Row(1).Column(2).Text("Due Date");
                                table.Cell().Row(1).Column(3).Text("Amount Due");
                                table.Cell().Row(1).Column(4).Text("Agreement ID");
                                table.Cell().Row(1).Column(5).Text("Customer Name");

                                uint row = 2;
                                foreach (var item in overdue)
                                {
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(1)
                                        .Text(item.InstallmentId.ToString());
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(2)
                                        .Text(item.DueDate.ToShortDateString());
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(3)
                                        .Text(item.AmountDue.ToString("C"));
                                    table
                                        .Cell()
                                        .Row(row)
                                        .Column(4)
                                        .Text(item.AgreementId.ToString());
                                    table.Cell().Row(row).Column(5).Text(item.CustomerName);
                                    row++;
                                }
                            });
                    });
                });
                return document.GeneratePdf();
            }
            throw new NotSupportedException("Format not supported.");
        }
    }
}