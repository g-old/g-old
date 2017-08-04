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

import FeedContainer from './FeedContainer';
import App from '../../components/App';

const middlewares = [thunk.withExtraArgument({ fetch: () => {} })];
const mockStore = configureStore(middlewares);
const initialState = {
  runtime: {
    availableLocales: ['de-DE'],
  },
  intl: {
    locale: 'de-DE',
  },
  entities: {
    users: {
      byId: {
        1: {
          id: '1',
          name: 'Grace',
          surname: 'Von',
          avatar: 'https://api.adorable.io/avatars/32/GraceVon.io.png',
        },
      },
    },
    votes: {
      1: {
        id: '1',
        position: 'con',
      },
    },
    statements: {
      byId: {
        1: {
          __typename: 'StatementDL',
          id: '1',
          likes: 0,
          text: 'before',
          pollId: '1',
          createdAt: 'Sat Jul 29 2017 23:52:50 GMT+0200 (CEST)',
          updatedAt: null,
          vote: '1',
          author: '1',
        },
      },
    },

    proposals: {
      byId: {
        1: { __typename: 'ProposalDL' },
      },
    },
    activities: {
      allIds: { ids: [1] },
      byId: {
        1: {
          id: '1',
          type: 'statement',
          objectId: '1',
          verb: 'create',
          createdAt: 'Sat Jun 17 2017 09:09:50 GMT+0200 (CEST)',
          actor: '1',
          object: {
            id: '1',
            schema: 'StatementDL',
          },
        },
      },
    },
  },
};

const updatedEntities = {
  entities: {
    users: {
      byId: {
        1: {
          id: '1',
          name: 'Grace',
          surname: 'Von',
          avatar: 'https://api.adorable.io/avatars/32/GraceVon.io.png',
        },
      },
    },
    votes: {
      1: {
        id: '1',
        position: 'con',
      },
    },
    statements: {
      byId: {
        1: {
          __typename: 'StatementDL',
          id: '1',
          likes: 0,
          text: 'after',
          pollId: '1',
          createdAt: 'Sat Jul 29 2017 23:52:50 GMT+0200 (CEST)',
          updatedAt: 'Sat Jul 29 2017 23:52:51 GMT+0200 (CEST)',
          vote: '1',
          author: '1',
        },
      },
    },

    proposals: {
      byId: {
        1: { __typename: 'ProposalDL' },
      },
    },
    activities: {
      allIds: { ids: [2, 1] },
      byId: {
        1: {
          id: '1',
          type: 'statement',
          objectId: '1',
          verb: 'create',
          createdAt: 'Sat Jun 17 2017 09:09:50 GMT+0200 (CEST)',
          actor: '1',
          object: {
            id: '1',
            schema: 'StatementDL',
          },
        },
        2: {
          id: '2',
          type: 'statement',
          objectId: '1',
          verb: 'update',
          createdAt: 'Sat Jun 17 2017 09:09:51 GMT+0200 (CEST)',
          actor: '1',
          object: {
            id: '1',
            schema: 'StatementDL',
          },
        },
      },
    },
  },
};
describe('FeedContainer', () => {
  it('Displays activity', () => {
    const store = mockStore(initialState);

    const wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();

    expect(wrapper).toMatchSnapshot();
  });

  it('Hides outdated content', () => {
    const updatedStore = {
      ...initialState,
      entities: {
        ...updatedEntities.entities,
      },
    };
    const store = mockStore(updatedStore);

    const wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();
    const asString = JSON.stringify(wrapper);
    expect(asString).toMatch(/after/);
  });

  it('Dont displays deleted statements', () => {
    const updatedStore = {
      ...initialState,
      entities: {
        ...updatedEntities.entities,
        activities: {
          allIds: { ids: [3, 2, 1] },
          byId: {
            ...updatedEntities.entities.activities.byId,
            3: {
              id: '3',
              type: 'statement',
              objectId: '1',
              verb: 'delete',
              createdAt: 'Sat Jun 17 2017 09:09:52 GMT+0200 (CEST)',
              actor: '1',
              object: {
                id: '1',
                schema: 'StatementDL',
              },
            },
          },
        },
      },
    };
    const store = mockStore(updatedStore);

    const wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();
    const asString = JSON.stringify(wrapper);
    expect(asString).not.toMatch(/after/);
  });

  it('Merges statements from same user on same poll', () => {
    const updatedStore = {
      ...initialState,
      entities: {
        ...updatedEntities.entities,
        statements: {
          byId: {
            ...updatedEntities.entities.statements.byId,
            2: {
              __typename: 'StatementDL',
              id: '2',
              likes: 0,
              text: 'next',
              pollId: '1',
              createdAt: 'Sat Jul 30 2017 23:52:50 GMT+0200 (CEST)',
              updatedAt: 'Sat Jul 30 2017 23:52:51 GMT+0200 (CEST)',
              vote: '2',
              author: '1',
            },
          },
        },

        votes: {
          ...updatedEntities.entities.votes,
          2: {
            id: '2',
            position: 'pro',
          },
        },
        activities: {
          allIds: { ids: [3, 2, 1] },
          byId: {
            ...updatedEntities.entities.activities.byId,
            3: {
              id: '3',
              type: 'statement',
              objectId: '2',
              verb: 'create',
              createdAt: 'Sat Jun 17 2017 10:09:52 GMT+0200 (CEST)',
              actor: '1',
              object: {
                id: '2',
                schema: 'StatementDL',
              },
            },
          },
        },
      },
    };
    let store = mockStore(updatedStore);

    let wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();
    let asString = JSON.stringify(wrapper);
    expect(asString).toMatch(/next/);

    const deleteLastStatementAfterVoteChangeStore = {
      ...updatedStore,
      entities: {
        ...updatedStore.entities,
        activities: {
          allIds: { ids: [4, 3, 2, 1] },
          byId: {
            ...updatedStore.entities.activities.byId,
            4: {
              id: '4',
              type: 'statement',
              objectId: '2',
              verb: 'delete',
              createdAt: 'Sat Jun 17 2017 10:09:52 GMT+0200 (CEST)',
              actor: '1',
              object: {
                id: '2',
                schema: 'StatementDL',
              },
            },
          },
        },
      },
    };

    store = mockStore(deleteLastStatementAfterVoteChangeStore);

    wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();
    asString = JSON.stringify(wrapper);
    expect(asString).not.toMatch(/next/);
    expect(asString).not.toMatch(/after/);

    // Test update of retracted

    const updateLastStatementAfterVoteChangeStore = {
      ...updatedStore,
      entities: {
        ...updatedStore.entities,
        statements: {
          byId: {
            ...updatedStore.entities.statements.byId,
            3: {
              __typename: 'StatementDL',
              id: '3',
              likes: 0,
              text: 'newest',
              pollId: '1',
              createdAt: 'Sat Jul 30 2017 23:52:50 GMT+0200 (CEST)',
              updatedAt: 'Sat Jul 30 2017 23:52:51 GMT+0200 (CEST)',
              vote: '2',
              author: '1',
            },
          },
        },
        activities: {
          allIds: { ids: [4, 3, 2, 1] },
          byId: {
            ...updatedStore.entities.activities.byId,
            4: {
              id: '4',
              type: 'statement',
              objectId: '2',
              verb: 'update',
              createdAt: 'Sat Jun 17 2017 10:09:52 GMT+0200 (CEST)',
              actor: '1',
              object: {
                id: '3',
                schema: 'StatementDL',
              },
            },
          },
        },
      },
    };

    store = mockStore(updateLastStatementAfterVoteChangeStore);

    wrapper = renderer
      .create(
        <IntlProvider>
          <App context={{ insertCss: () => {}, store }}>
            <FeedContainer />
          </App>
        </IntlProvider>,
      )
      .toJSON();
    asString = JSON.stringify(wrapper);
    expect(asString).not.toMatch(/next/);
    expect(asString).toMatch(/newest/);
  });
});
