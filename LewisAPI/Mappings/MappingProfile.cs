using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Models;

namespace LewisAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>();
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Order Mappings
            CreateMap<Order, OrderDto>();
            CreateMap<OrderItem, OrderItemDto>();
            CreateMap<OrderItemDto, OrderItem>(); // For checkout

            // Credit Mappings
            CreateMap<CreditAgreement, CreditAgreementDto>();
            CreateMap<Installment, InstallmentDto>();

            // Delivery Mappings
            CreateMap<Delivery, DeliveryDto>();

            // Payment Mappings
            CreateMap<Payment, PaymentDto>();
            CreateMap<PaymentDto, Payment>();

            // User/Profile Mappings (assuming ApplicationUser and Customer models)
            CreateMap<Customer, ProfileDto>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address)) // If one-to-one
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode));
            CreateMap<RegisterDTO, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone));
            CreateMap<RegisterDTO, Customer>(); // Separate if needed
            CreateMap<UpdateProfileDto, ApplicationUser>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<UpdateProfileDto, Customer>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
