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

// http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
export const utcCorrectedDate = (daysAdded) => {
  const local = new Date();
  if (daysAdded) {
    local.setDate(local.getDate() + daysAdded);
  }
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toJSON();
};

const thresholdPassedUniversal = (poll, thresholdRef) => {
  let ref;
  switch (thresholdRef) {
    case 'voters':
      ref = poll.upvotes + poll.downvotes;
      break;
    case 'all':
      ref = poll.allVoters;
      break;

    default:
      throw Error(`Threshold reference not implemented: ${thresholdRef}`);
  }

  ref *= poll.threshold / 100;
  return ref <= poll.upvotes;
};
export const getLastActivePoll = (state, proposal) => {
  let poll;
  switch (state) {
    case 'proposed': {
      poll = proposal.pollOne;
      break;
    }
    case 'voting': {
      poll = proposal.pollTwo;
      break;
    }
    case 'accepted': {
      // TODO check only dates
      if (thresholdPassedUniversal(proposal.pollOne, proposal.pollOne.mode.thresholdRef)) {
        if (thresholdPassedUniversal(proposal.pollTwo, proposal.pollTwo.mode.thresholdRef)) {
          poll = proposal.pollTwo;
        } else {
          throw Error('A proposal cannot fail at pollTwo and be accepted');
        }
      } else {
        poll = proposal.pollOne;
      }
      break;
    }
    case 'revoked': {
      poll = proposal.pollOne;
      break;
    }
    case 'rejected': {
      poll = proposal.pollTwo;

      break;
    }

    default:
      throw Error(`Unknown proposal state: ${proposal.state}`);
  }
  return poll;
};
