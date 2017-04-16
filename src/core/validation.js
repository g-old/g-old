import { validateEmail } from './helpers';

export function passwordValidation(password, values, { minPasswordLength }) {
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

export function emailValidation(email, { invalidEmails }) {
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
      (acc, curr) => acc += mailAddress === curr ? 1 : 0,
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

export function createValidator(allValues, validators, options, obj) {
  return properties => {
    const result = properties.reduce(
      (acc, curr) => {
        const value = obj.state[curr];
        const errors = validators[allValues[curr].fn](value, obj.state, options);
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
