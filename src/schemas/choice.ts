import { Schema, SchemaHandlers, SchemaParameters } from '../schema';
import {
  DeprecatedResult,
  ExpectedResult,
  ForwardResult,
  RedirectResult,
  TransferTo,
  Utils,
  ValidateResult,
} from '../types';
import { comparePrimitive, mapFromArray } from '../utils';

interface ChoiceInfo {
  value: ChoiceValue;
  deprecated?: boolean;
  redirect?: TransferTo;
  forward?: TransferTo;
  /** do not show this value in `expected` */
  hidden?: boolean;
}

type ChoiceValue = undefined | null | boolean | number | string;

interface ChoiceSchemaParameters
  extends SchemaParameters<ChoiceValue>,
    SchemaHandlers<ChoiceValue> {
  choices: Array<ChoiceValue | ChoiceInfo>;
}

export class ChoiceSchema extends Schema<ChoiceValue, ChoiceSchemaParameters> {
  private _choices: Map<ChoiceValue, ChoiceInfo>;

  constructor(parameters: ChoiceSchemaParameters) {
    super(parameters);
    this._choices = mapFromArray(
      parameters.choices.map(
        choice =>
          choice && typeof choice === 'object' ? choice : { value: choice },
      ),
      'value',
    );
  }

  public expected({ descriptor }: Utils): ExpectedResult {
    const choiceDescriptions = Array.from(this._choices.keys())
      .map(value => this._choices.get(value)!)
      .filter(({ hidden }) => !hidden)
      .map(choiceInfo => choiceInfo.value)
      .sort(comparePrimitive)
      .map(descriptor.value);

    const head = choiceDescriptions.slice(0, -2);
    const tail = choiceDescriptions.slice(-2);
    const message = head.concat(tail.join(' or ')).join(', ');

    return {
      text: message,
      list: {
        title: 'one of the following values',
        values: choiceDescriptions,
      },
    };
  }

  public validate(value: unknown): ValidateResult {
    return this._choices.has(value as any);
  }

  public deprecated(value: ChoiceValue): DeprecatedResult<ChoiceValue> {
    const choiceInfo = this._choices.get(value);
    return choiceInfo && choiceInfo.deprecated ? { value } : false;
  }

  public forward(value: ChoiceValue): ForwardResult<ChoiceValue> {
    const choiceInfo = this._choices.get(value);
    return choiceInfo ? choiceInfo.forward : undefined;
  }

  public redirect(value: ChoiceValue): RedirectResult<ChoiceValue> {
    const choiceInfo = this._choices.get(value);
    return choiceInfo ? choiceInfo.redirect : undefined;
  }
}
