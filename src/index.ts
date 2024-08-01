import type { EmailProviderConfig, EmailProviderModule, SendOptions } from './types'

const EXTRA_EMAIL_PROVIDER_NAME = 'strapi-provider-email-locale'

interface ProviderOption {
  mock?: boolean
  defaultProvider: string
  providers: {
    [key: string]: EmailProviderConfig
  }
}

interface Settings {
  defaultFrom: string
  defaultReplyTo: string
}

/* eslint-disable no-console */
export default {
  async init(providerOptions: ProviderOption, settings: Settings) {
    const extraEmailProviderMock = {
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
        strapi.log.debug('[extra-email-provider] [mock mode] email-send() called')
        console.log(providerOptions)
        console.log(settings)
        console.log(msg)
      },
    }

    // if extra-provider is in mock mode, we just log send-mail params to console
    if (providerOptions.mock) {
      strapi.log.debug('return mock extra')
      return extraEmailProviderMock
    }

    // load main email provider
    console.log(providerOptions)
    const mainProviderID: string = providerOptions.defaultProvider
    const mainProviderName = providerOptions.providers[mainProviderID].provider || providerOptions.defaultProvider
    const mainProviderConfig = providerOptions.providers[mainProviderID]
    let mainProvider = null

    // check recursive use of 'extra-email-provider' usages
    console.log(mainProviderName, mainProviderConfig)
    if (mainProviderName === EXTRA_EMAIL_PROVIDER_NAME) {
      console.log('we are in mock option')
      if (!(mainProviderConfig.providerOptions as any).mock)
        throw new Error(`You should only use ${EXTRA_EMAIL_PROVIDER_NAME} in mock mode.`)
      mainProvider = extraEmailProviderMock
    }
    else {
      mainProvider = await loadProvider(mainProviderConfig)
    }

    return {
      send(options: SendOptions): void {
        strapi.log.debug('[extra-email-provider] email-send() called')
        strapi.log.debug(`[extra-email-provider] main provider is: ${mainProviderName} with this config:`)
        console.log(mainProviderConfig)
        strapi.log.debug('[extra-email-provider] calling main provider send-email')
        mainProvider.send(options)
      },
    }
  },
}

async function loadProvider(providerConfig: EmailProviderConfig) {
  const providerName = providerConfig.provider.toLowerCase()
  let provider: EmailProviderModule

  let modulePath: string
  try {
    modulePath = require.resolve(`@strapi/provider-email-${providerName}`)
  }
  catch (error) {
    if (
      error !== null
      && typeof error === 'object'
      && 'code' in error
      && error.code === 'MODULE_NOT_FOUND'
    )
      modulePath = providerName
    else
      throw error
  }

  try {
    provider = await import(modulePath)
  }
  catch (err) {
    throw new Error(`Could not load email provider "${providerName}".`)
  }

  if (!provider.init)
    throw new Error(`Email provider "${providerName}" dose not have "init" method.`)

  return provider.init(providerConfig.providerOptions, providerConfig.settings)
}
