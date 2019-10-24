/* eslint-disable import/prefer-default-export */

import { IntlProvider } from 'react-intl';

import {
  SET_LOCALE_START,
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR,
} from '../constants';

const query = `
  query ($locale:String!) {
    intl (locale:$locale) {
      id
      message
    }
  }
`;
export const locales = {
  'de-DE': 'DE',
  'it-IT': 'IT',
  'lld-IT': 'LLD',
};
function getIntlFromState(state) {
  const intl = (state && state.intl) || {};
  const { initialNow, locale, messages } = intl;
  const localeMessages = (messages && messages[locale]) || {};
  const provider = new IntlProvider({
    initialNow,
    locale,
    messages: localeMessages,
    defaultLocale: 'de-DE',
  });
  return provider.getChildContext().intl;
}

export function getIntl() {
  return (dispatch, getState) => getIntlFromState(getState());
}

export function setLocale({ locale }) {
  return async (dispatch, getState, { graphqlRequest, history }) => {
    dispatch({
      type: SET_LOCALE_START,
      payload: {
        locale,
      },
    });

    try {
      const { data } = await graphqlRequest(query, { locale });
      const messages = data.intl.reduce((msgs, msg) => {
        msgs[msg.id] = msg.message; // eslint-disable-line no-param-reassign
        return msgs;
      }, {});
      dispatch({
        type: SET_LOCALE_SUCCESS,
        payload: {
          locale,
          messages,
        },
      });

      // remember locale for every new request
      if (process.env.BROWSER) {
        //  const consent = getState().consent;
        //  if (consent === 'YES') {
        const maxAge = 365 * 24 * 3600; // 1 year in seconds
        document.cookie = `lang=${locale};path=/;max-age=${maxAge}`;
        history.push(`?lang=${locale}`);
        //  }
      }

      // return bound intl instance at the end
      return getIntlFromState(getState());
    } catch (error) {
      dispatch({
        type: SET_LOCALE_ERROR,
        payload: {
          locale,
          error,
        },
      });
      return null;
    }
  };
}
