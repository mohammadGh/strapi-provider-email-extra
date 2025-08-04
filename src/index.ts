import type { EmailProviderConfig, EmailProviderModule, SendOptions } from './types'
import { defu } from 'defu'
import { name } from '../package.json'
import { fetchUserByEmail, makeTemplate } from './template'
import { hasKey } from './utils'

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
    testEmailSubjectToMatch: string
    forgotPasswordUrl: string
    sendEmailConfirmationUrl: string
    registerUrl: string
    vars: { [key: string]: string | number | boolean | undefined } // additional variables to be used in dynamic templates interpolation
  }
}

const defaultProviderOption: ProviderOption = {
  mock: false,
  defaultProvider: '',
  providers: {},
  dynamicTemplates: {
    enabled: true,
    collection: 'api::email-template.email-template',
    subjectMatcherField: 'subjectMatcher',
    testEmailSubjectToMatch: 'Strapi test mail',
    forgotPasswordUrl: '/api/auth/forgot-password',
    sendEmailConfirmationUrl: '/api/auth/send-email-confirmation',
    registerUrl: '/api/auth/local/register',
    vars: {
    },
  },
}

/**
 * email settings like default from or to and other fields
 */
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
          if (emailSubject && emailSubject.toLowerCase().startsWith(providerOptions.dynamicTemplates.testEmailSubjectToMatch.toLowerCase())) {
            emailSubject = providerOptions.dynamicTemplates.testEmailSubjectToMatch
          }

          // first check is email-template collection exists
          const contentTypes = strapi.contentTypes// v4: strapi.container.get('content-types')
          if (!hasKey(contentTypes, collectionName))
            throw new Error(`Collection "${collectionName}" does not exist to load dynamic email template.`)

          // get email-template based on email's subject
          const defaultLocale = await strapi.plugins.i18n.services.locales?.getDefaultLocale()
          const strapiContext = strapi.requestContext.get()
          const currentLocale = strapiContext?.query?.locale
          debug(`Default-locale is: "${defaultLocale}", and requested locale is: "${currentLocale}"`)

          const whichTemplateQuery = {
            locale: currentLocale || defaultLocale || undefined,
            filters: {} as any,
            start: 0,
            limit: 1,
          }
          whichTemplateQuery.filters[providerOptions.dynamicTemplates.subjectMatcherField] = { $eqi: emailSubject }

          const templateEntries = await strapi.entityService.findMany(collectionName, whichTemplateQuery)

          const template = templateEntries && templateEntries[0]

          if (!template) {
            warn(`No dynamic email template found for email subject "${emailSubject}" in collection template "${collectionName}"`)
          }
          else {
            debug(`Dynamic templates is found for email subject "${emailSubject}" in collection template "${collectionName}"`)

            // try interpolate template with context data like confirmation-token or rest-password-token
            if (template.text || template.html) {
              let user, CODE
              const email = strapiContext?.request?.body?.email
              const requestPath = strapiContext?.request?.path
              if (email) {
                if (requestPath === providerOptions.dynamicTemplates.forgotPasswordUrl) {
                  user = await fetchUserByEmail(email)
                  CODE = user && user.resetPasswordToken
                }
                else if (requestPath === providerOptions.dynamicTemplates.registerUrl || requestPath === providerOptions.dynamicTemplates.sendEmailConfirmationUrl) {
                  user = await fetchUserByEmail(email)
                  CODE = user && user.confirmationToken
                }
              }
              template.text = template.text && await makeTemplate(template.text, { path: requestPath, user, data: { ...providerOptions.dynamicTemplates.vars, CODE } })
              template.html = template.html && await makeTemplate(template.html, { path: requestPath, user, data: { ...providerOptions.dynamicTemplates.vars, CODE } })

              const mergedOptions = defu(template, options)

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
