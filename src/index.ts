import importSync from 'import-sync'
import { name } from '../package.json'
import type { EmailProviderConfig, EmailProviderModule, SendOptions } from './types'

const PACKAGE_NAME = name

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
  init(providerOptions: ProviderOption, settings: Settings) {
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
        strapi.log.debug('[extra-email-provider::mock-mode] email-send() called with email data:')
        console.log(msg)
      },
    }

    // if extra-provider is in mock mode, we just log send-mail params to console
    if (providerOptions.mock)
      return extraEmailProviderMock

    // load main email provider
    const mainProviderID: string = providerOptions.defaultProvider
    const mainProviderName = providerOptions.providers[mainProviderID].provider || providerOptions.defaultProvider
    const mainProviderConfig = providerOptions.providers[mainProviderID]
    let mainProvider = null

    // check recursive use of 'extra-email-provider'
    if (mainProviderName === PACKAGE_NAME) {
      if (!(mainProviderConfig.providerOptions as any).mock)
        throw new Error(`You should only use "${PACKAGE_NAME}" in mock mode inside "providers".`)
      mainProvider = extraEmailProviderMock
    }
    else {
      strapi.log.debug(`[extra-email-provider] try loading provider: ${mainProviderName}`)
      mainProvider = loadProvider(mainProviderConfig)
      strapi.log.debug(`[extra-email-provider] ${mainProviderName} loaded successfully`)
    }

    return {
      send(options: SendOptions): void {
        strapi.log.debug('[extra-email-provider] calling main provider send-email')
        mainProvider.send(options)
      },
    }
  },
}

function loadProvider(providerConfig: EmailProviderConfig) {
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
    provider = importSync(modulePath)
  }
  catch (err) {
    throw new Error(`Could not load email provider "${providerName}".`)
  }

  if (!provider.init)
    throw new Error(`Email provider "${providerName}" dose not have "init" method.`)

  return provider.init(providerConfig.providerOptions, providerConfig.settings)
}
