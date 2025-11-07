using System.Net;

namespace LewisAPI.Middleware
{
    public class ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment env
    )
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;
        private readonly IWebHostEnvironment _env = env;

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unhandled exception occurred");
                await HandleExceptionAsync(context, e);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            object response;
            if (_env.IsDevelopment())
            {
                response = new
                {
                    error = exception.Message,
                    stackTrace = exception.StackTrace,
                    code = context.Response.StatusCode,
                };
            }
            else
            {
                response = new
                {
                    error = "Internal Server Error",
                    code = context.Response.StatusCode,
                };
            }

            return context.Response.WriteAsJsonAsync(response);
        }
    }
}
