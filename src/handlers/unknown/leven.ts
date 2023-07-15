import chalk from 'chalk'
import leven from 'leven'
import { UnknownHandler } from '../../types.js'

export const levenUnknownHandler: UnknownHandler = (
  key,
  value,
  { descriptor, logger, schemas },
) => {
  const messages = [
    `Ignored unknown option ${chalk.yellow(descriptor.pair({ key, value }))}.`,
  ]

  const suggestion = Object.keys(schemas)
    .sort()
    .find(knownKey => leven(key, knownKey) < 3)

  if (suggestion) {
    messages.push(`Did you mean ${chalk.blue(descriptor.key(suggestion))}?`)
  }

  logger.warn(messages.join(' '))
}
