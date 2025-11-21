using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Models;

namespace LewisAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            //CreateMap<Product, ProductDto>()
            //    .ForMember(
            //        dest => dest.Image1,
            //        opt =>
            //            opt.MapFrom(src =>
            //                src.Image1 != null ? Convert.ToBase64String(src.Image1) : null
            //            )
            //    )
            //    .ReverseMap()
            //    .ForMember(
            //        dest => dest.Image1,
            //        opt =>
            //            opt.MapFrom(src =>
            //                !string.IsNullOrEmpty(src.Image1)
            //                    ? Convert.FromBase64String(src.Image1)
            //                    : null
            //            )
            //    );





            // Keep your existing ProductListDto mapping (URL-based, good for performance in lists)
            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom<ProductImageUrlResolver>())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));



            // For imports (already handles string -> byte[] in controller, but ensure DTO has string)
            CreateMap<ProductImportDto, Product>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId ?? Guid.NewGuid()))
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());

            CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());

            CreateMap<UpdateProductDto, Product>()
                .ForMember(dest => dest.ProductId, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ProductImportDto, Product>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId ?? Guid.NewGuid()))
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());

            CreateMap<ApplicationUser, UserManagementDto>()
            // Example of explicit mapping if property names don't match exactly
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            // Assuming your ApplicationUser has these properties (or you map them from claims/other sources)
            .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom(src => src.ProfilePicture))
            .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedAt)) // Example property name
            .ForMember(dest => dest.LastLogin, opt => opt.Ignore());

            // ============================================
            // ORDER MAPPINGS - NO CIRCULAR REFERENCES
            // ============================================
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.CustomerId, opt => opt.MapFrom(src => src.CustomerId))
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => src.OrderDate))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.SubTotal))
                .ForMember(dest => dest.DeliveryFee, opt => opt.MapFrom(src => src.DeliveryFee))
                .ForMember(dest => dest.Tax, opt => opt.MapFrom(src => src.Tax))
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src => src.Total))
                .ForMember(dest => dest.PaymentType, opt => opt.MapFrom(src => src.PaymentType))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems ?? new List<OrderItem>()))
                .ForMember(dest => dest.Delivery, opt => opt.MapFrom(src => src.Delivery))
                .ForMember(dest => dest.CreditAgreement, opt => opt.MapFrom(src => src.CreditAgreement))
                .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payments ?? new List<Payment>()));

            // OrderItem -> OrderItemDto (NO OrderId to prevent circular refs)
            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.OrderItemId, opt => opt.MapFrom(src => src.OrderItemId))
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
                .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.LineTotal));

            CreateMap<OrderItemDto, OrderItem>();

            // ============================================
            // DELIVERY MAPPINGS - NO ORDER REFERENCE IN DTO
            // ============================================
            CreateMap<Delivery, DeliveryDto>()
                .ForMember(dest => dest.DeliveryId, opt => opt.MapFrom(src => src.DeliveryId))
                .ForMember(dest => dest.Courier, opt => opt.MapFrom(src => src.Courier ?? ""))
                .ForMember(dest => dest.TrackingNumber, opt => opt.MapFrom(src => src.TrackingNumber ?? ""))
                .ForMember(dest => dest.Fee, opt => opt.MapFrom(src => src.Fee))
                .ForMember(dest => dest.EstimatedDeliveryDate, opt => opt.MapFrom(src => src.EstimatedDeliveryDate))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                // Ignore Order navigation to prevent circular references
                .ForSourceMember(src => src.Order, opt => opt.DoNotValidate());

            // ============================================
            // CREDIT AGREEMENT MAPPINGS - NO ORDER REFERENCE
            // ============================================
            CreateMap<CreditAgreement, CreditAgreementDto>()
                .ForMember(dest => dest.AgreementId, opt => opt.MapFrom(src => src.AgreementId))
                .ForMember(dest => dest.Principal, opt => opt.MapFrom(src => src.Principal))
                .ForMember(dest => dest.InterestRate, opt => opt.MapFrom(src => src.InterestRate))
                .ForMember(dest => dest.TermMonths, opt => opt.MapFrom(src => src.TermMonths))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.NextDueDate, opt => opt.MapFrom(src => src.NextDueDate))
                .ForMember(dest => dest.OutstandingBalance, opt => opt.MapFrom(src => src.OutstandingBalance))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Installments, opt => opt.MapFrom(src => src.Installments ?? new List<Installment>()))
                // Ignore Order navigation to prevent circular references
                .ForSourceMember(src => src.Order, opt => opt.DoNotValidate());

            // ============================================
            // INSTALLMENT MAPPINGS
            // ============================================
            CreateMap<Installment, InstallmentDto>()
                .ForMember(dest => dest.InstallmentId, opt => opt.MapFrom(src => src.InstallmentId))
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.DueDate))
                .ForMember(dest => dest.AmountDue, opt => opt.MapFrom(src => src.AmountDue))
                .ForMember(dest => dest.PrincipalComponent, opt => opt.MapFrom(src => src.PrincipalComponent))
                .ForMember(dest => dest.InterestComponent, opt => opt.MapFrom(src => src.InterestComponent))
                .ForMember(dest => dest.AmountPaid, opt => opt.MapFrom(src => src.AmountPaid))
                .ForMember(dest => dest.PaidDate, opt => opt.MapFrom(src => src.PaidDate))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                // Ignore Agreement navigation to prevent cycles
                .ForSourceMember(src => src.Agreement, opt => opt.DoNotValidate());


            // ============================================
            // PAYMENT MAPPINGS - NO CIRCULAR REFERENCES
            // ============================================
            CreateMap<Payment, PaymentDto>()
                .ForMember(dest => dest.PaymentId, opt => opt.MapFrom(src => src.PaymentId))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.AgreementId, opt => opt.MapFrom(src => src.AgreementId))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount))
                .ForMember(dest => dest.PaymentDate, opt => opt.MapFrom(src => src.PaymentDate))
                .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Method))
                .ForMember(dest => dest.Reference, opt => opt.MapFrom(src => src.Reference))
                .ForMember(dest => dest.ReceivedBy, opt => opt.MapFrom(src => src.ReceivedBy))
                // Ignore navigation properties to prevent cycles
                .ForSourceMember(src => src.Order, opt => opt.DoNotValidate())
                .ForSourceMember(src => src.Agreement, opt => opt.DoNotValidate())
                .ForSourceMember(src => src.ReceivedByUser, opt => opt.DoNotValidate());

            CreateMap<PaymentDto, Payment>()
                .ForMember(dest => dest.Order, opt => opt.Ignore())
                .ForMember(dest => dest.Agreement, opt => opt.Ignore())
                .ForMember(dest => dest.ReceivedByUser, opt => opt.Ignore());

            // ============================================
            // USER/PROFILE MAPPINGS
            // ============================================
            CreateMap<ApplicationUser, ProfileDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom(src => src.ProfilePicture));

            CreateMap<RegisterDTO, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone));

            CreateMap<RegisterDTO, Customer>();

            CreateMap<UpdateProfileDto, ApplicationUser>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateProfileDto, Customer>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
