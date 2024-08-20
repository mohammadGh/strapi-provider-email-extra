import { defu } from 'defu'
import { name } from '../package.json'
import type { EmailProviderConfig, EmailProviderModule, SendOptions } from './types'

const PACKAGE_NAME = name

interface ProviderOption {
  mock: boolean
  defaultProvider: string
  providers: {
    [key: string]: EmailProviderConfig
  }
  dynamicTemplates: {
    enabled: boolean
    collection: string
    subjectMatcherField: string
    testEmailMatcherSubject: string
  }
}

const defaultProviderOption = {
  mock: false,
  defaultProvider: '',
  providers: null,
  dynamicTemplates: {
    enabled: true,
    collection: 'api::test-template.test-template',
    subjectMatcherField: 'subjectMatcher',
    testEmailMatcherSubject: 'Strapi test mail',
  },
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
        info('[mock-mode] send-email() called with this email data:')
        console.log(msg)
      },
    }

    // apply defaultProviderOptions
    providerOptions = defu(providerOptions, defaultProviderOption)

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
      debug(`Try loading provider: ${mainProviderName}`)
      mainProvider = loadProvider(mainProviderConfig, settings)
      debug(`Provider: ${mainProviderName} loaded successfully`)
    }

    return {
      async send(options: SendOptions): Promise<void> {
        // check dynamic-template
        if (providerOptions.dynamicTemplates.enabled) {
          const collectionName = providerOptions.dynamicTemplates.collection

          let emailSubject = options.subject

          // check if the email is from 'test email delivery' (from email plugin configuration panel in strapi-admin)
          if (emailSubject && emailSubject.toLowerCase().startsWith(providerOptions.dynamicTemplates.testEmailMatcherSubject.toLowerCase())) {
            emailSubject = providerOptions.dynamicTemplates.testEmailMatcherSubject
          }

          // first check is email-template collection exists
          const contentTypes = strapi.container.get('content-types')
          if (!contentTypes.keys().includes(collectionName)) {
            warn(`Collection "${collectionName}" not exist to load dynamic email template`)
          }
          else {
            // get email-template based on email's subject
            const defaultLocale = await strapi.plugins.i18n.services.locales?.getDefaultLocale()
            const currentLocale = strapi.requestContext.get()?.query?.locale
            debug(`Default-locale is: "${defaultLocale}", and requested locale is: "${currentLocale}"`)

            const whichTemplateQuery = {
              locale: currentLocale || defaultLocale || undefined,
              filters: {} as any,
              start: 0,
              limit: 1,
            }
            whichTemplateQuery.filters[providerOptions.dynamicTemplates.subjectMatcherField] = { $eqi: emailSubject }

            const templateEntries = await strapi.entityService.findMany(collectionName, whichTemplateQuery)

            const templateEntry = templateEntries && templateEntries[0]

            if (!templateEntry) {
              warn(`No dynamic email template found for email subject "${emailSubject}" in collection template "${collectionName}"`)
            }
            else {
              debug(`Dynamic templates is found for email subject "${emailSubject}" in collection template "${collectionName}"`)
              // debug(`merging dynamic template with default settings:\n`)
              const mergedOptions = { ...options, ...templateEntry }
              // console.log(mergedOptions)
              debug(`Try sending email with main provider: ${mainProviderName}`)
              return mainProvider.send(mergedOptions)
            }
          }
        }
        debug(`Calling main provider send-email with: ${mainProviderName}`)
        return mainProvider.send(options)
      },
    }
  },
}

function loadProvider(providerConfig: EmailProviderConfig, defaultSetting: Settings) {
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
    ) {
      modulePath = providerName
    }
    else {
      throw error
    }
  }

  try {
    // eslint-disable-next-line ts/no-require-imports
    provider = require(modulePath)
  }
  catch {
    throw new Error(`Could not load email provider "${providerName}".`)
  }

  if (!provider.init)
    throw new Error(`Email provider "${providerName}" dose not have "init" method.`)

  return provider.init(providerConfig.providerOptions, { ...defaultSetting, ...providerConfig.settings })
}

function warn(msg: string) {
  strapi.log.warn(`[${PACKAGE_NAME}] ${msg}`)
}

function debug(msg: string) {
  strapi.log.debug(`[${PACKAGE_NAME}] ${msg}`)
}

function info(msg: string) {
  strapi.log.info(`[${PACKAGE_NAME}] ${msg}`)
}
