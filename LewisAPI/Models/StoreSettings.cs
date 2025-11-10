using System.Text.Json.Serialization;

namespace LewisAPI.Models
{
    public class StoreSettings
    {
        public int Id { get; set; } = 1;
        public decimal DefaultInterestRate { get; set; } = 0.10m;
        public decimal SetupFee { get; set; } = 50.00m;
        public Dictionary<string, decimal> DeliveryOptions { get; set; } =
            new Dictionary<string, decimal>();
        public string BillingCycleStart { get; set; } = "NextMonth";
        public int GracePeriodDays { get; set; } = 0;
        public decimal LateFeePercentage { get; set; } = 0.05m;
        public string DefaultPlanType { get; set; } = "Amortized";
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public string DeliveryOptionsJson
        {
            get => System.Text.Json.JsonSerializer.Serialize(DeliveryOptions);
            set =>
                DeliveryOptions =
                    System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, decimal>>(value)
                    ?? new();
        }
    }
}
