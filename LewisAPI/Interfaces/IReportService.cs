namespace LewisAPI.Interfaces
{
    public interface IReportService
    {
        Task<byte[]> GenerateSalesReportAsync(DateTime start, DateTime end, string format);

        Task<byte[]> GeneratePaymentsReportAsync(DateTime start, DateTime end, string format);

        Task<byte[]> GenerateOverdueReportAsync(string format);
    }
}
