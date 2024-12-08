/* eslint-disable ts/no-require-imports */
/* eslint-disable perfectionist/sort-imports */
// based on code in strapi-users-permissions plugin

import _ from 'lodash'

const {
  template: { createStrictInterpolationRegExp },
  errors,
  objects,
} = require('@strapi/utils')

export async function makeTemplate(layout: string, params: { path: string, user: any, data: any }) {
  const interData = {
    URL: getAbsoluteServerUrl(strapi.config) + params.path,
    SERVER_URL: getAbsoluteServerUrl(strapi.config),
    ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
    USER: await getUserInfo(params.user),
    ...params.data,
  }

  const allowedTemplateVariables = objects.keysDeep(interData)

  // Create a strict interpolation RegExp based on possible variable names
  const interpolate = createStrictInterpolationRegExp(allowedTemplateVariables, 'g')

  try {
    return _.template(layout, { interpolate })(interData)
  }
  catch (e: any) {
    strapi.log.debug(e)
    throw new errors.ApplicationError('Invalid email template')
  }
}

export async function getUserInfo(user: any) {
  const schema = await strapi.getModel('plugin::users-permissions.user')
  const sanitizedUserInfo = await strapi.contentAPI.sanitize.output(user, schema, { /* auth */ })
  return sanitizedUserInfo
}

export async function fetchUserByEmail(email: string) {
  return await strapi
    .query('plugin::users-permissions.user')
    .findOne({ where: { email } })
}

function getAbsoluteServerUrl(strapiConfig: any) {
  const { host, port, url } = strapiConfig.server
  const protocol = strapiConfig.server.ssl ? 'https' : 'http'
  return url || `${protocol}://${host}:${port}`
}

function getAbsoluteAdminUrl(strapiConfig: any) {
  const baseUrl = getAbsoluteServerUrl(strapiConfig)
  const adminPath = strapi.config?.admin?.url || '/admin' // Default admin path

  return `${baseUrl}${adminPath}`
}
