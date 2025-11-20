namespace LewisAPI.Models
{
    public class StoreSettings
    {
        public Guid Id { get; set; }
        public string Key { get; set; } // e.g., "DefaultInterestRate", "SetupFee", "DeliveryOptions:local"
        public string Value { get; set; }
    }
}
