import { validateEmail, concatDateAndTime, utcCorrectedDate } from './helpers';

export function passwordValidation(
  password,
  values,
  { minPasswordLength = 0 },
) {
  const pw = password.trim();
  let result = {
    touched: false,
  };

  if (!pw) {
    result = {
      touched: true,
      errorName: 'empty',
    };
  } else if (pw.length < minPasswordLength) {
    result = {
      touched: true,
      errorName: 'shortPassword',
    };
  }
  return result;
}

export function passwordAgainValidation(passwordAgain, { password }) {
  const pwAgain = passwordAgain.trim();
  let result = {
    touched: false,
  };

  if (!pwAgain) {
    result = {
      touched: true,
      errorName: 'empty',
    };
  } else if (password.trim() !== pwAgain) {
    result = {
      touched: true,
      errorName: 'passwordMismatch',
    };
  }
  return result;
}

export function selectValidation(selection, inputField) {
  const result = {
    touched: false,
  };
  if (!selection) {
    return {
      touched: true,
      errorName: 'empty',
    };
  }
  if (inputField) {
    if (!selection) {
      return {
        touched: true,
        errorName: 'wrongSelect',
      };
    }
    const sel = `${selection.name} ${selection.surname}`;
    if (sel !== inputField) {
      return {
        touched: true,
        errorName: 'wrongSelect',
      };
    }
  }

  return result;
}

export function dateToValidation(date) {
  // TODO finish
  let result = {
    touched: false,
  };
  if (date) {
    const testDate = new Date(date);
    testDate.setHours(0, 0, 0, 0);
    const referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);
    if (testDate < referenceDate) {
      result = {
        touched: true,
        errorName: 'past',
      };
    }
  }
  return result;
}

export function timeToValidation(time, { dateTo }) {
  let result = {
    touched: false,
  };
  if (time) {
    let date;
    if (dateTo) {
      date = dateTo;
    } else {
      date = utcCorrectedDate(3).slice(0, 10);
    }
    const endTime = concatDateAndTime(date, time);
    if (endTime < new Date()) {
      result = {
        touched: true,
        errorName: 'past',
      };
    }
  }
  return result;
}

export function nameValidation(name) {
  const n = name.toString().trim();
  let result = {
    touched: false,
  };
  if (!n) {
    result = {
      touched: true,
      errorName: 'empty',
    };
  }
  return result;
}

export function emailValidation(email, { invalidEmails = [] }) {
  const mailAddress = email.trim().toLowerCase();
  let result = {
    touched: false,
  };
  if (!mailAddress) {
    result = {
      touched: true,
      errorName: 'empty',
    };
  } else if (!validateEmail(mailAddress)) {
    result = {
      touched: true,
      errorName: 'invalidEmail',
    };
  } else {
    // TODO UI feedback not implemented!
    const duplicate = invalidEmails.reduce(
      // eslint-disable-next-line
      (acc, curr) => (acc += mailAddress === curr ? 1 : 0),
      0,
    );
    if (duplicate) {
      result = {
        touched: true,
        errorName: 'emailTaken',
      };
    }
  }

  return result;
}

export const capitalizeFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1).trim();

export function createValidator(
  allValues,
  validators,
  obj,
  resolverFn,
  options = {},
) {
  return properties => {
    const result = properties.reduce(
      (acc, curr) => {
        let state = resolverFn(obj);
        const value = state[curr]; // obj[curr];
        if ('valuesResolver' in allValues[curr]) {
          state = allValues[curr].valuesResolver(obj);
        }

        const errors = validators[allValues[curr].fn](value, state, options);
        // eslint-disable-next-line no-param-reassign
        acc.errors[curr] = {
          ...errors,
        };
        // eslint-disable-next-line no-param-reassign
        acc.failed += errors.touched ? 1 : 0;
        return acc;
      },
      { errors: {}, failed: 0 },
    );
    return result;
  };
}
