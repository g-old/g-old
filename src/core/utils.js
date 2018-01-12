/* eslint-disable import/prefer-default-export */

export const throwIfMissing = argsName => {
  throw new Error(`Argument is missing: ${argsName}`);
};
