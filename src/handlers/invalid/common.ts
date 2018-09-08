import chalk from 'chalk';
import { VALUE_NOT_EXIST } from '../../constants';
import {
  Descriptor,
  InvalidHandler,
  NormalizedExpectedResult,
  OptionKey,
  OptionValue,
} from '../../types';

const INDENTATION = ' '.repeat(2);

export const commonInvalidHandler: InvalidHandler = (key, value, utils) => {
  const { text, list } = utils.normalizeExpectedResult(
    utils.schemas[key].expected(utils),
  );

  const descriptions: string[] = [];

  // istanbul ignore else
  if (text) {
    descriptions.push(getDescription(key, value, text, utils.descriptor));
  }

  if (list) {
    descriptions.push(
      [getDescription(key, value, list.title, utils.descriptor)]
        .concat(
          list.values.map(valueDescription =>
            getListDescription(valueDescription, utils.loggerPrintWidth),
          ),
        )
        .join('\n'),
    );
  }

  return chooseDescription(descriptions, utils.loggerPrintWidth);
};

function getDescription(
  key: OptionKey,
  value: OptionValue,
  expected: string,
  descriptor: Descriptor,
) {
  return [
    `Invalid ${chalk.red(descriptor.key(key))} value.`,
    `Expected ${chalk.blue(expected)},`,
    `but received ${
      value === VALUE_NOT_EXIST
        ? chalk.gray('nothing')
        : chalk.red(descriptor.value(value))
    }.`,
  ].join(' ');
}

function getListDescription(
  { text, list }: NormalizedExpectedResult,
  printWidth: number,
): string {
  const descriptions: string[] = [];

  if (text) {
    descriptions.push(`- ${chalk.blue(text)}`);
  }

  if (list) {
    descriptions.push(
      [`- ${chalk.blue(list.title)}:`]
        .concat(
          list.values.map(valueDescription =>
            getListDescription(
              valueDescription,
              printWidth - INDENTATION.length,
            ).replace(/^|\n/g, `$&${INDENTATION}`),
          ),
        )
        .join('\n'),
    );
  }

  return chooseDescription(descriptions, printWidth);
}

function chooseDescription(descriptions: string[], printWidth: number) {
  if (descriptions.length === 1) {
    return descriptions[0];
  }

  const [firstDescription, secondDescription] = descriptions;
  const [firstWidth, secondWidth] = descriptions.map(
    description => description.split('\n', 1)[0].length,
  );

  return firstWidth > printWidth && firstWidth > secondWidth
    ? secondDescription
    : firstDescription;
}
