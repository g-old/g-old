import { inspect } from 'util';

function inspectObject(object) {
  return inspect(object, {
    colors: true,
  });
}

const actionFormatters = {
  SET_LOCALE_SUCCESS: a =>
    `locale ${a.payload.locale}: ${
      Object.keys(a.payload.messages).length
    } messages`,
};

// Server side redux action logger
export default function createLogger() {
  // eslint-disable-next-line no-unused-vars
  return store => next => action => {
    let formattedPayload = '';
    const actionFormatter = actionFormatters[action.type];
    if (typeof actionFormatter === 'function') {
      formattedPayload = actionFormatter(action);
    } else if (action.toString !== Object.prototype.toString) {
      formattedPayload = action.toString();
    } else if (typeof action.payload !== 'undefined') {
      formattedPayload = inspectObject(action.payload);
    } else {
      formattedPayload = inspectObject(action);
    }

    console.log(` * ${action.type}: ${formattedPayload}`); // eslint-disable-line no-console
    return next(action);
  };
}
