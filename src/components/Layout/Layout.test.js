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
const initialState = {
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
    users: { byId: {} },
  },
  ui: {
    activityCounter: {
      feed: 0,
      proposals: 0,
    },
  },
};

describe('Layout', () => {
  it('renders children correctly', () => {
    const store = mockStore(initialState);
    const initialNow = new Date();
    const wrapper = renderer
      .create(
        <IntlProvider locale="en" initialNow={initialNow}>
          <App
            context={{
              intl: {
                initialNow: 1501773564065,
                locale: 'de-DE',
                newLocale: null,
                messages: {
                  'de-DE': {},
                },
              },
              fetch: () => {},
              insertCss: () => {},
              store,
            }}
            store={store}
          >
            <Layout>
              <div className="child" />
            </Layout>
          </App>
        </IntlProvider>,
      )
      .toJSON();

    expect(wrapper).toMatchSnapshot();
  });
});
