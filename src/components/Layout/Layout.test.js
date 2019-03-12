/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from 'react-intl';
import App from '../App';
import Layout from './Layout';

const middlewares = [thunk.withExtraArgument({ fetch: () => {} })];
const mockStore = configureStore(middlewares);

const setupApp = (store, intl, element) => (
  <App
    context={{
      /* intl: {
          initialNow: 1501773564065,
          formattedMessage: () => 'translated text',
          formatDate: () => 'formatted date',
          formatTime: () => 'formatted time',
          formatRelative: () => 'formatted relative',
          formatNumber: () => 'formatted number',
          formatPlural: () => 'formatted plural',
          formatMessage: () => 'formatted message',
          formatHTMLMessage: () => 'formatted html',
          now: () => new Date(),
          locale: 'de-DE',
          newLocale: null,
          messages: {
            'de-DE': {},
          },
        },*/
      intl,
      fetch: () => {},
      insertCss: () => {},
      store,
    }}
  >
    {element}
  </App>
);
const initialState = {
  user: null,
  runtime: {
    initialNow: 1501773564066,
    availableLocales: ['de-DE'],
  },
  intl: {
    initialNow: 1501773564065,
    locale: 'de-DE',
    newLocale: null,
    messages: {
      'de-DE': {},
    },
  },
  entities: {
    users: {
      byId: {},
    },
    workTeams: { byId: null },
  },
  ui: {
    activityCounter: {
      feed: 0,
      proposals: 0,
    },
    loading: {
      status: false,
    },
  },
  system: {
    droneBuild: 'fff',
  },
};

describe('Layout', () => {
  test('renders children correctly', () => {
    const store = mockStore(initialState);
    const intl = new IntlProvider({
      initialNow: new Date(15e11),
      defaultLocale: 'de-DE',
      locale: 'de-DE',
      messages: {},
    }).getChildContext();
    const wrapper = renderer
      .create(
        setupApp(
          store,
          intl,
          <Layout>
            <div className="child" />
          </Layout>,
        ),
      )
      .toJSON();

    expect(wrapper).toMatchSnapshot();
  });
});
