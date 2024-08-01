export interface EmailProviderConfig extends Record<string, unknown> {
  provider: string
  providerOptions?: object
  settings?: {
    defaultFrom?: string
  }
}

export interface EmailTemplateData {
  url?: string
  user?: {
    email: string
    firstname: string
    lastname: string
    username: string
  }
}

export interface EmailOptions {
  from?: string
  to: string
  cc?: string
  bcc?: string
  replyTo?: string
  [key: string]: string | undefined // to allow additional template attributes if needed
}

export interface EmailTemplate {
  subject: string
  text: string
  html?: string
  [key: string]: string | undefined // to allow additional template attributes if needed
}

export type SendOptions = EmailOptions & EmailTemplate

interface EmailProvider {
  send: (options: SendOptions) => Promise<any>
}

export interface EmailProviderModule {
  init?: (
    options: EmailProviderConfig['providerOptions'],
    settings: EmailProviderConfig['settings']
  ) => EmailProvider
  name?: string
  provider?: string
}
