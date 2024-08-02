# Strapi Email Provider Extra

## Overview

`strapi-email-provider-extra`  is a email provider for the [Strapi CMS](https://github.com/strapi/strapi) that acts as a wrapper for various popular email providers such as [MailGun](https://market.strapi.io/providers/@strapi-provider-email-mailgun), [SendGrid](https://market.strapi.io/providers/@strapi-provider-email-sendgrid), [Nodemailer](https://market.strapi.io/providers/@strapi-provider-email-nodemailer) or etc. This plugin adds the functionality to send localized email templates based on the current or user-requested locale, enhancing the internationalization capabilities of your Strapi application.

## Features

- **Flexible Provider Support**: Easily integrate with your preferred email provider (Mailgun, SendGrid, Nodemailer, etc.).
- **Localization**: Send emails using locale-specific templates to provide a personalized user experience.
- **Customizable**: Configure and extend the plugin to suit your needs with ease.

## Installation

1. **Install the Plugin**:
   ```bash
   npm install strapi-email-provider-wrapper
   ```

2. **Configure the Plugin**:
   Add the configuration to your `config/plugins.js` file:
   ```javascript
   module.exports = ({ env }) => ({
     email: {
       provider: 'strapi-email-provider-extra',
       providerOptions: {
         defaultProvider: 'sendgrid', // or 'mailgun', 'nodemailer', etc.
         providers: {
           sendgrid: {
             apiKey: env('SENDGRID_API_KEY'),
           },
           mailgun: {
             apiKey: env('MAILGUN_API_KEY'),
             domain: env('MAILGUN_DOMAIN'),
           },
           nodemailer: {
             service: 'gmail',
             auth: {
               user: env('GMAIL_USER'),
               pass: env('GMAIL_PASS'),
             },
           },
         },
         defaultLocale: 'en', // Default locale
         templates: {
           en: {
             welcome: 'templates/welcome_en.html',
             resetPassword: 'templates/resetPassword_en.html',
           },
           fr: {
             welcome: 'templates/welcome_fr.html',
             resetPassword: 'templates/resetPassword_fr.html',
           },
           // Add more locales and templates as needed
         },
       },
     },
   })
   ```

## Usage

To use the email provider wrapper in your Strapi application, you can call the `send` method provided by the plugin.

### Example

```javascript
const emailService = strapi.plugins.email.services.email

const emailOptions = {
  to: 'user@example.com',
  subject: 'Welcome to Our Service',
  template: 'welcome',
  locale: 'fr', // Optional, defaults to 'en' or configured default locale
}

await emailService.send(emailOptions)
```

## Configuration Options

- **defaultProvider**: The default email provider to use if none is specified.
- **providers**: Configuration for each supported email provider.
- **defaultLocale**: The default locale to use for email templates.
- **templates**: Object defining the paths to email templates for each locale.

## Contributing

We welcome contributions to improve this project. To contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project was inspired by the need for flexible and localized email sending capabilities within the Strapi CMS ecosystem.

With Strapi Email Provider Wrapper, you can now send personalized, localized emails with ease, leveraging your preferred email provider. Enjoy streamlined communication with your international user base!

For any issues or feature requests, please open an issue on our [Issues](https://github.com/yourusername/strapi-email-provider-wrapper/issues).
