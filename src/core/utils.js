import { tModel } from './accessControl';

// @flow
/* eslint-disable import/prefer-default-export */
export const throwIfMissing = argsName => {
  throw new Error(`Argument is missing: ${argsName}`);
};

type ValidationErrorInfo = {
  fields: string[],
  model: tModel,
};

export class ValidationError extends Error {
  info: ValidationErrorInfo;
  message: string;
  constructor(info: ValidationErrorInfo) {
    super();
    this.info = info;
    this.message = 'Validation error';
  }
}
