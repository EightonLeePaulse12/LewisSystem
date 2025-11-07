using Hangfire.Dashboard;

namespace LewisAPI.Filters // Adjust namespace to match your project
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            // Check if authenticated and in allowed roles
            return httpContext.User.Identity?.IsAuthenticated == true
                && (httpContext.User.IsInRole("Admin") || httpContext.User.IsInRole("Manager"));
        }
    }
}
