// @flow
import { GraphQLScalarType, Kind } from 'graphql';

// taken from https://github.com/excitement-engineer/graphql-iso-date/blob/master/src/utils/validator.js

function leapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function validateTime(time) {
  const TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  return TIME_REGEX.test(time);
}

function validateDate(dateString) {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;

  if (!RFC_3339_REGEX.test(dateString)) {
    return false;
  }

  const year = Number(dateString.substr(0, 4));
  const month = Number(dateString.substr(5, 2));
  const day = Number(dateString.substr(8, 2));

  switch (month) {
    case 2: // February
      if (leapYear(year) && day > 29) {
        return false;
      }
      if (!leapYear(year) && day > 28) {
        return false;
      }
      return true;
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      if (day > 30) {
        return false;
      }
      break;
    default:
      if (day !== 31) {
        return false;
      }
  }

  return true;
}

function validateDateTime(dateTimeString) {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  if (!RFC_3339_REGEX.test(dateTimeString)) {
    return false;
  }

  const time = Date.parse(dateTimeString);
  // eslint-disable-next-line no-self-compare
  if (time !== time) {
    return false;
  }

  const index = dateTimeString.indexOf('T');
  const dateString = dateTimeString.substr(0, index);
  const timeString = dateTimeString.substr(index + 1);
  return validateDate(dateString) && validateTime(timeString);
}
function parseDateTime(value) {
  return value; // TODO change to Date-object
}

function serializeDate(value) {
  if (value && value.constructor === Date) {
    return value.toString();
  }
  throw new TypeError('Only Date objects allowed');
}

function coerceDate(value) {
  if (!(typeof value === 'string' || value instanceof String)) {
    throw new TypeError('Date must be a string');
  }
  // Do some checks?
  if (validateDateTime(value)) {
    return parseDateTime(value);
  }
  throw new TypeError(`Date-time string is invalid: ${value}`);
}

function parseAST(ast) {
  if (ast.kind !== Kind.STRING) {
    throw new TypeError('Date must be a string');
  }
  if (validateDateTime(ast)) {
    return parseDateTime(ast);
  }
  throw new TypeError(`Date-time string is invalid: ${ast}`);
}

export default new GraphQLScalarType({
  name: 'Date',
  description:
    'The `Date` scalar type represents the toString()-fn of a Date object',
  serialize: serializeDate,
  parseValue: coerceDate,
  parseLiteral: parseAST,
});
