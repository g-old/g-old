// eslint-disable-next-line import/prefer-default-export
export const thresholdPassed = poll =>
  // eslint-disable-next-line no-mixed-operators
  poll.upvotes >= Math.floor(poll.allVoters / 100 * poll.threshold);

export const validateEmail = email => {
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
export const dedup = arr => {
  const hashTable = {};

  return arr.filter(el => {
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
export const utcCorrectedDate = daysAdded => {
  const local = new Date();
  if (daysAdded) {
    local.setDate(local.getDate() + daysAdded);
  }
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toJSON();
};
/*
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
}; */
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
      if (proposal.pollTwo && proposal.pollTwo.closedAt) {
        poll = proposal.pollTwo;
      } else {
        poll = proposal.pollOne;
      }
      /*  if (thresholdPassedUniversal(proposal.pollOne, proposal.pollOne.mode.thresholdRef)) {
        if (thresholdPassedUniversal(proposal.pollTwo, proposal.pollTwo.mode.thresholdRef)) {
          poll = proposal.pollTwo;
        } else {
          throw Error('A proposal cannot fail at pollTwo and be accepted');
        }
      } else {
        poll = proposal.pollOne;
      } */
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

    case 'survey': {
      poll = proposal.pollOne;
      break;
    }

    default:
      throw Error(`Unknown proposal state: ${proposal.state}`);
  }
  return poll;
};

export function findScrollParents(element, horizontal) {
  const result = [];
  let parent = element.parentNode;
  while (parent && parent.getBoundingClientRect) {
    const rect = parent.getBoundingClientRect();
    // 10px is to account for borders and scrollbars in a lazy way
    if (horizontal) {
      if (rect.width && parent.scrollWidth > rect.width + 10) {
        result.push(parent);
      }
    } else if (rect.height && parent.scrollHeight > rect.height + 10) {
      result.push(parent);
    }
    parent = parent.parentNode;
  }
  // last scrollable element will be the document
  // if nothing else is scrollable in the page
  if (result.length === 0) {
    result.push(document);
  }
  return result;
}

export const getErrors = (state, action) =>
  Object.keys(state).reduce((acc, curr) => {
    if (curr in action.properties && state[curr].pending) {
      let error = action.message || true;
      if (action.message.fields) {
        // means only valid for specific property
        error = false;
        if (action.message.fields[curr]) {
          error = action.message.fields[curr];
        }
      }
      // eslint-disable-next-line no-param-reassign
      acc[curr] = {
        pending: false,
        success: false,
        error,
      };
    }
    return acc;
  }, {});

export const getSuccessState = (state, action) =>
  Object.keys(state).reduce((acc, curr) => {
    if (curr in action.properties && state[curr].pending) {
      // eslint-disable-next-line no-param-reassign
      acc[curr] = {
        pending: false,
        success: true,
        error: null,
      };
    }
    return acc;
  }, {});

export const genStatusIndicators = data => {
  let component = null;
  if (Array.isArray(data)) {
    component = data;
  } else if (typeof data === 'object') {
    component = Object.keys(data);
  }
  return component.reduce((acc, curr) => {
    // eslint-disable-next-line no-param-reassign
    acc[curr] = {
      pending: true,
      success: false,
      error: null,
    };
    return acc;
  }, {});
};

// from: https://gist.github.com/malko/ff77f0af005f684c44639e4061fa8019
/* eslint-disable no-mixed-operators */
export const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+") //eslint-disable-line
    .replace(/_/g, "/"); // eslint-disable-line
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};
/* eslint-enable no-mixed-operators */

// from https://github.com/firebase/firebase-js-sdk/blob/master/src/messaging/controllers/window-controller.ts
/* eslint-disable no-prototype-builtins */
export const isPushAvailable = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window &&
  ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification') &&
  PushSubscription.prototype.hasOwnProperty('getKey');
/* eslint-enable no-prototype-builtins */

// from https://stackoverflow.com/questions/10348906/how-to-know-if-a-request-is-http-or-https-in-node-js
export const getProtocol = req => {
  let proto = req.connection.encrypted ? 'https' : 'http';
  // only do this if you trust the proxy
  proto = req.headers['x-forwarded-proto'] || proto;
  return proto.split(/\s*,\s*/)[0];
};

export const getFilter = proposal => {
  const status = proposal.state;
  switch (status) {
    case 'accepted':
      return 'accepted';
    case 'proposed':
      return proposal.pollOne.closedAt ? 'wait' : 'active';
    case 'voting':
      return 'active';
    case 'survey':
      return 'survey';
    default:
      return 'repelled';
  }
};
