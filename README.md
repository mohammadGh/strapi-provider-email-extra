# Strapi Email Provider Extra

## Overview

`strapi-email-provider-extra`  is a email provider for the [Strapi CMS](https://github.com/strapi/strapi) that acts as a wrapper for various popular email providers such as
[MailGun](https://market.strapi.io/providers/@strapi-provider-email-mailgun),
[SendGrid](https://market.strapi.io/providers/@strapi-provider-email-sendgrid),
[Mailjet](https://github.com/ijsto/strapi-provider-email-mailjet),
[Azure Email](https://market.strapi.io/providers/strapi-provider-email-azure),
[Resend](https://market.strapi.io/providers/strapi-provider-email-resend),
[Nodemailer](https://market.strapi.io/providers/@strapi-provider-email-nodemailer) or etc. This plugin adds the functionality to send localized email templates based on the current or user-requested locale, enhancing the internationalization capabilities of your Strapi application.

## Features

- **Flexible Provider Support**: Easily integrate with your preferred email provider (Mailgun, SendGrid, Nodemailer, etc.).
- **Localization**: Send emails using locale-specific templates to provide a personalized user experience.
- **Customizable**: Configure and extend the plugin to suit your needs with ease.

## Installation

1. **Install the Plugin**:
   ```bash
   npm install strapi-email-provider-extra
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
              testEmailMatcherSubject: 'Strapi test mail'
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
      - `from` as email (used in the from section of email)
      - `text` as rich-text for your email body
      - `html` as rich-text for your email body as html

4. **Add your email templates for "Account Confirmation" or "Reset-password" or any subject with your prefer locales :**

    Now, add email templates with any locale you want to `EmailTemplate` with `subjectMatcher` for different categories:
      - `subjectMatcher: 'Account Confirmation'`: for emails that the system will send when new user created to confirm account.
      - `subjectMatcher: 'Reset Password'`: for emails that the system will send when user forget the password.
      - `subjectMatcher: 'Strapi test mail'`:for test emails that you can send them through Strapi Admin UI.

## Usage Examples
Now, when new user registered or forgot-password, the email content automatically fetched from your localized test templates with proper locale.
the proper locale is chosen from default locale of strapi (can set in Strapi Admin UI), or from request's query option.

For example, to send a France email template in user registration api, call the register api like this with `locale=fr` in query params:

```javascript
fetch('http://localhost:1337/api/auth/local/register?locale=fr', {
  method: 'POST',
  body: {
    username: 'my-user',
    email: 'user-email@gmail.com',
    pass: '123456'
  }
})
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.error(error))
```
To send localized emails in your Strapi application, you can call the `send` method provided by the email's plugin.

```javascript
const emailService = strapi.plugins.email.services.email

const emailOptions = {
  to: 'user@example.com',
  subject: 'Welcome to Our Service', // the subject must exist in your test-template collection in `subjectMatcher` field.
  locale: 'fr', // Optional, defaults to configured default locale of strapi or will be fetched from user's request query.
}

await emailService.send(emailOptions)
```

## Configuration Options

- **defaultProvider**: The default email provider to use for sending email.
- **providers**: Configuration for each supported email provider.
- **dynamicTemplates**: Configuration for localized email templates.

## Contributing

We welcome contributions to improve this project. To contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project was inspired by the need for flexible and localized email sending capabilities within the Strapi CMS ecosystem.

With Strapi Email Provider Extra, you can now send personalized, localized emails with ease, leveraging your preferred email provider. Enjoy streamlined communication with your international user base!

For any issues or feature requests, please open an issue on our [Issues](https://github.com/yourusername/strapi-email-provider-extra/issues).
