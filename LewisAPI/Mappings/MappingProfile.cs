using AutoMapper;
using LewisAPI.DTOs;
using LewisAPI.Models;

namespace LewisAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(
                    dest => dest.Image1,
                    opt =>
                        opt.MapFrom(src =>
                            src.Image1 != null ? Convert.ToBase64String(src.Image1) : null
                        )
                )
                .ForMember(
                    dest => dest.Image2,
                    opt =>
                        opt.MapFrom(src =>
                            src.Image2 != null ? Convert.ToBase64String(src.Image2) : null
                        )
                )
                .ForMember(
                    dest => dest.Image3,
                    opt =>
                        opt.MapFrom(src =>
                            src.Image3 != null ? Convert.ToBase64String(src.Image3) : null
                        )
                );
            ;
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
            CreateMap<ApplicationUser, ProfileDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.UserName))
                .ForMember(
                    dest => dest.ProfilePicture,
                    opt => opt.MapFrom(src => src.ProfilePicture)
                );

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
