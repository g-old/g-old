// eslint-disable-next-line import/prefer-default-export
export const thresholdPassed = poll =>
  poll.upvotes >= Math.floor((poll.allVoters / 100) * poll.threshold);

export const validateEmail = email => {
  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line max-len
  // http://www.regular-expressions.info/email.html
  // eslint-disable-next-line max-len
  //  let re = /^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}$)[A-Z0-9._%+-]{1,64}@(?:(?=[A-Z0-9-]{1,63}\.)[A-Z0-9]+(?:-[A-Z0-9]+)*\.){1,8}[A-Z]{2,63}$/;
  return re.test(email);
};
