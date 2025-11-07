using LewisAPI.Infrastructure;
using LewisAPI.Interfaces;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace LewisAPI.Services
{
    public class SendGridEmailService : IEmailService
    {
        private readonly SendGridSettings _settings;

        public SendGridEmailService(IOptions<SendGridSettings> options)
        {
            _settings = options.Value;
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlMessage,
            string? plainTextMessage = null
        )
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("SendGrid API Key is not configured");

            var client = new SendGridClient(_settings.ApiKey);
            var from = new EmailAddress(_settings.FromEmail, _settings.FromName);
            var to = new EmailAddress(toEmail);
            plainTextMessage ??= htmlMessage; // fallback if plain text not provided

            var msg = MailHelper.CreateSingleEmail(
                from,
                to,
                subject,
                plainTextMessage,
                htmlMessage
            );

            var response = await client.SendEmailAsync(msg);
        }
    }
}
