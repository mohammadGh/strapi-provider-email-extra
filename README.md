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
        config: {

          provider: 'strapi-provider-email-extra',
          providerOptions: {
            defaultProvider: 'nodemailer', // or 'mailgun', 'mailjet', etc.
            providers: {
              nodemailer: {
                provider: 'nodemailer',
                providerOptions: {
                  host: 'smtp.ethereal.email',
                  port: 587,
                  secure: false,
                  auth: {
                    user: 'claire.daugherty82@ethereal.email',
                    pass: 'w6nhfjaAnKd7Asczzv',
                  }
                }
              }
            },

            // default template options
            dynamicTemplates: {
              enabled: true,
              collection: 'api::email-template.email-template',
              subjectMatcherField: 'subjectMatcher',
              testEmailMatcherSubject: 'STRAPI TEST MAIL'
            }
          },

          // email settings
          settings: {
            defaultFrom: 'info@mycompany.co',
            defaultFromName: 'My Company'
          },
        }
      }
    })
    ```
3. **create a collection content in `Content-Type Builder` to localize your email template:**

    Now, create a collection named `EmailTemplate` which api id: `email-template`. check `internationalization` checkbox in advance-setting tab when creating this collection.
    The `EmailTemplate` collection should contains this fields:
      - `subjectMatcher` as text
      - `subject` as text for your email subject
      - `text` as rich-text for your email body
      - `html` as rich-text for your email body as html

4. **Add your email templates for "Account Confirmation" or "Reset-password" or any subject with your prefer locales :**

    Now, add email templates with any locale you want to `EmailTemplate`.

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
