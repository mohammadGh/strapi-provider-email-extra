/* eslint-disable no-console */
interface Settings {
  defaultFrom: string
  defaultReplyTo: string
}

interface SendOptions {
  from?: string
  to: string
  cc: string
  bcc: string
  replyTo?: string
  subject: string
  text: string
  html: string
  [key: string]: unknown
}

type ProviderOptions = any

export default {
  init(providerOptions: ProviderOptions, settings: Settings) {
    return {
      send(options: SendOptions): void {
        const { from, to, cc, bcc, replyTo, subject, text, html, ...rest } = options

        const msg = {
          from: from || settings.defaultFrom,
          to,
          cc,
          bcc,
          replyTo: replyTo || settings.defaultReplyTo,
          subject,
          text,
          html,
          ...rest,
        }
        console.log('email provider - send called')
        console.log(msg)
      },
    }
  },
}
