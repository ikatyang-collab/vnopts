import { eachHandler } from '../../tests/__helpers__/utils';
import { ArraySchema } from './array';
import { BooleanSchema } from './boolean';
import { ChoiceSchema } from './choice';

const name = '<key>';
const value = '<value>';
const invalid = '<invalid-value>';
const deprecated = '<deprecated-value>';
const transfer = '<transfer-value>';
const forward = '<forward-value>';
const redirect = '<redirect-value>';

describe.each`
  parameters | input                              | output                                    | hasWarnings
  ${{}}      | ${{ [name]: [value] }}             | ${{ [name]: [value] }}                    | ${false}
  ${{}}      | ${{ [name]: value }}               | ${Error}                                  | ${false}
  ${{}}      | ${{ [name]: [value, invalid] }}    | ${Error}                                  | ${false}
  ${{}}      | ${{ [name]: [value, deprecated] }} | ${{ [name]: [value, deprecated] }}        | ${true}
  ${{}}      | ${{ [name]: [value, forward] }}    | ${{ [name]: [value, forward, transfer] }} | ${false}
  ${{}}      | ${{ [name]: [value, redirect] }}   | ${{ [name]: [value, transfer] }}          | ${false}
  ${{}}      | ${{ [name]: [redirect] }}          | ${{ [name]: [transfer] }}                 | ${false}
`(
  '',
  eachHandler<ArraySchema<ChoiceSchema>>(ArraySchema, {
    valueSchema: new ChoiceSchema({
      name,
      choices: [
        value,
        { value: transfer },
        { value: redirect, redirect: { key: name, value: [transfer] } },
        { value: forward, forward: { key: name, value: [transfer] } },
        { value: deprecated, deprecated: true },
      ],
    }),
  }),
);

describe.each`
  parameters | input                    | output   | hasWarnings
  ${{}}      | ${{ [name]: 'invalid' }} | ${Error} | ${false}
`(
  '(simple expected values)',
  eachHandler<ArraySchema<BooleanSchema>>(ArraySchema, {
    valueSchema: new BooleanSchema({ name }),
  }),
);

describe.each`
  parameters | input                    | output   | hasWarnings
  ${{}}      | ${{ [name]: 'invalid' }} | ${Error} | ${false}
`(
  '(complex expected values)',
  eachHandler<ArraySchema<ChoiceSchema>>(ArraySchema, {
    valueSchema: new ChoiceSchema({
      name,
      choices: Array.from(new Array(20), (_value, index) => `value${index}`),
    }),
  }),
);
