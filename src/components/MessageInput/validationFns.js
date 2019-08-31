export const EMPTY = '<p></p>';

export const isHtmlEmpty = html => {
  if (html) {
    const str = html.trim();
    return !str || !str.length || str === EMPTY;
  }
  return true;
};
const translationVal = fieldName => (input, state) => {
  let result = { touched: false };
  if (isHtmlEmpty(input)) {
    if (isHtmlEmpty(state[`${fieldName}de`])) {
      if (isHtmlEmpty(state[`${fieldName}it`])) {
        result = { touched: true, errorName: 'empty' };
      }
    }
  }
  return result;
};

export const lazyValidationFailure = (errors, isDraft) => {
  let cannotPass = false;
  if (errors) {
    let criticalErrors = [
      'subjectit',
      'subjectde',
      'recipients',
      'recipientType',
      'textde',
      'textit',
    ];
    if (isDraft) {
      criticalErrors = ['textde', 'textit'];
    }
    cannotPass = Object.keys(errors).some(error =>
      criticalErrors.find(cE => errors[error].touched && error === cE),
    );
  }
  return cannotPass;
};

export const recipientValidation = (recipients, state) => {
  let result = { touched: false };
  if (
    !recipients.length &&
    !['ALL', 'ROLE'].includes(state.recipientType.value)
  ) {
    result = {
      touched: true,
      errorName: 'empty',
    };
  }
  return result;
};

export const textValidation = translationVal('text');
export const subjectValidation = translationVal('subject');
