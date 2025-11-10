namespace LewisAPI.Models
{
    public enum ProductStatus
    {
        Active,
        Inactive,
    }

    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Packed,
        Dispatched,
        Delivered,
        Cancelled,
        Returned,
    }

    public enum PaymentType
    {
        Cash,
        Credit,
    }

    public enum InventoryTransactionType
    {
        Creation,
        Update,
        Deletion,
        Import,
        Export,
        Sale,
    }

    public enum InstallmentStatus
    {
        Pending,
        Paid,
        Overdue,
    }

    public enum CreditAgreementStatus
    {
        Active,
        Completed,
        Defaulted,
    }

    public enum DeliveryStatus
    {
        Pending,
        InTransit,
        Delivered,
        Failed,
    }

    public enum CreditPlanType
    {
        Amortized,
        Simple,
        InterestOnly,
        Balloon,
    }
}
