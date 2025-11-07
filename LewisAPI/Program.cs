using System.Text;
using System.Threading.RateLimiting;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.PostgreSql;
using LewisAPI.Filters;
using LewisAPI.Infrastructure.Data;
using LewisAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

namespace LewisAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
                .CreateBootstrapLogger();

            builder.Host.UseSerilog();

            // Add services to the container.

            builder.WebHost.UseKestrel(options =>
            {
                options.ListenAnyIP(8080);
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(
                    "StrictPolicy",
                    builder =>
                        builder
                            .WithOrigins("https://yourfrontend.com") // Replace with your actual frontend URL(s), e.g., "http://localhost:3000" for dev
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials()
                );
            });

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder
                .Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            builder
                .Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                        ),
                        ClockSkew = TimeSpan.Zero,
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            Log.Error("Authentication failed: {Exception}", context.Exception);
                            return Task.CompletedTask;
                        },
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy(
                    "ManagerOrAdmin",
                    policy => policy.RequireRole("Manager", "Admin")
                ); // Fixed comma separation
                options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
            });

            builder
                .Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters();

            builder.Services.AddMemoryCache();
            // Rate Limiter (native - removed old singleton as it's not needed)
            builder.Services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
                    context =>
                        RateLimitPartition.GetFixedWindowLimiter(
                            partitionKey: context.Connection.RemoteIpAddress?.ToString()
                                ?? "unknown",
                            factory: _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 100,
                                Window = TimeSpan.FromMinutes(1),
                                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                                QueueLimit = 0,
                            }
                        )
                );
                // Custom rule for login
                options.AddFixedWindowLimiter(
                    "login",
                    options =>
                    {
                        options.PermitLimit = 5;
                        options.Window = TimeSpan.FromMinutes(1);
                    }
                );

                options.OnRejected = async (context, token) =>
                {
                    context.HttpContext.Response.StatusCode = 429; // Too Many Requests
                    await context.HttpContext.Response.WriteAsync(
                        "Rate Limit exceeded. Try Again Later",
                        token // Added token for cancellation
                    );
                };
            });

            // Exception Handling - Add your custom middleware service (assuming you have ExceptionHandlingMiddleware class)
            // builder.Services.AddTransient<ExceptionHandlingMiddleware>(); // If singleton/transient as needed

            builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>();
            // Add more checks, e.g., .AddHangfire(h => h.MaximumJobsFailed = 1);

            builder.Services.AddHangfire(config =>
                config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(c =>
                        c.UseNpgsqlConnection(
                            builder.Configuration.GetConnectionString("HangfireConnection")
                        )
                    )
            ); // Use your conn string (can be same as DefaultConnection if shared)
            builder.Services.AddHangfireServer();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.Migrate(); // Creates/updates schema based on your migrations
            }

            app.UseCors("StrictPolicy"); // Use the strict policy name

            app.MapHealthChecks("/health");

            app.UseSwagger();
            app.UseRateLimiter();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //app.UseHttpsRedirection();

            app.UseSerilogRequestLogging(); // Added for request logging

            app.UseAuthentication();
            app.UseAuthorization();

            // Hangfire Dashboard - Added mapping with basic auth (implement HangfireAuthorizationFilter as before)
            app.UseHangfireDashboard(
                "/hangfire",
                new DashboardOptions
                {
                    Authorization = new[] { new HangfireAuthorizationFilter() }, // Add your custom filter class for RBAC
                }
            );

            // Exception Middleware - Add if you have the class
            // app.UseMiddleware<ExceptionHandlingMiddleware>();

            app.MapControllers();

            app.Run();
        }
    }
}
