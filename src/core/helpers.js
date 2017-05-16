// eslint-disable-next-line import/prefer-default-export
export const thresholdPassed = poll =>
  // eslint-disable-next-line no-mixed-operators
  poll.upvotes >= Math.floor(poll.allVoters / 100 * poll.threshold);

export const validateEmail = (email) => {
  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line max-len
  // http://www.regular-expressions.info/email.html
  // eslint-disable-next-line max-len
  //  let re = /^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}$)[A-Z0-9._%+-]{1,64}@(?:(?=[A-Z0-9-]{1,63}\.)[A-Z0-9]+(?:-[A-Z0-9]+)*\.){1,8}[A-Z]{2,63}$/;
  return re.test(email);
};

// https://gist.github.com/jed/982883
// This is quite slow in comparison to uuid
/* eslint-disable */
export function b(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
}
/* eslint-enable */

// http://www.jstips.co/en/javascript/deduplicate-an-array/
export const dedup = (arr) => {
  const hashTable = {};

  return arr.filter((el) => {
    const key = JSON.stringify(el);
    const match = Boolean(hashTable[key]);

    return match ? false : (hashTable[key] = true);
  });
};

export const concatDateAndTime = (date, time) => {
  const d = date || new Date().toJSON().slice(0, 10);
  const t = time || new Date().toJSON().slice(11, 16);
  return new Date(`${d} ${t}`);
};
