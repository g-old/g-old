/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */
import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from 'react-intl';

import StatementsContainer from './StatementsContainer';
import App from '../../components/App';

const middlewares = [thunk.withExtraArgument({ fetch: () => {} })];
const mockStore = configureStore(middlewares);
const setupApp = (store, element) => (
  <IntlProvider locale="de-DE" initialNow={new Date()}>
    <App
      context={{
        intl: {
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
        },
        fetch: () => {},
        insertCss: () => {},
        store,
      }}
    >
      {element}
    </App>
  </IntlProvider>
);

const defaultUser = {
  id: 1,
  role: {
    type: 'user',
  },
};

const defaultPollingMode = {
  id: 1,
  withStatements: true,
};
const defaultPoll = {
  id: 1,
  upvotes: 0,
  downvotes: 0,
  likedStatements: null,
  ownStatement: null,
  ownVote: null,
  closedAt: null,
  mode: '1',
};

const initialState = {
  runtime: {
    availableLocales: ['de-DE'],
  },
  intl: {
    locale: 'de-DE',
  },
  entities: {
    roles: {
      2: {
        type: 'user',
      },
    },
    users: {
      byId: {
        1: {
          id: '1',
          name: 'firstOne',
          surname: 'lastOne',
          thumbnail: 'https://api.adorable.io/avatars/32/firstOne.io.png',
          role: 3,
        },
        2: {
          id: '2',
          name: 'firstTwo',
          surname: 'lastTwo',
          thumbnail: 'https://api.adorable.io/avatars/32/firstTwo.io.png',
          role: 3,
        },
      },
    },
    votes: {
      1: {
        id: '1',
        position: 'con',
      },
      2: {
        id: '2',
        position: 'con',
      },
    },
    polls: {
      1: {
        ...defaultPoll,
      },
    },
    statements: {
      byId: {
        1: {
          __typename: 'StatementDL',
          id: '1',
          likes: 5,
          text: 'before',
          pollId: '1',
          createdAt: 'Sat Jul 29 2017 23:52:50 GMT+0200 (CEST)',
          updatedAt: null,
          vote: '1',
          author: '1',
        },
        2: {
          __typename: 'StatementDL',
          id: '2',
          likes: 4,
          text: 'before',
          pollId: '1',
          createdAt: 'Sat Jul 29 2017 23:52:50 GMT+0200 (CEST)',
          updatedAt: null,
          vote: '2',
          author: '2',
        },
      },
      byPoll: {
        1: {
          all: [1, 2],
        },
      },
    },

    proposals: {
      byId: {
        1: { __typename: 'ProposalDL' },
      },
    },
    pollingModes: {
      1: { ...defaultPollingMode },
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
  ui: {},
};

const initPoll = {
  ...defaultPoll,
  mode: {
    ...defaultPollingMode,
  },
};

const defaultFollowees = [];

describe('StatementsContainer', () => {
  it('Displays statements', () => {
    const store = mockStore(initialState);
    const wrapper = renderer
      .create(
        setupApp(
          store,
          <StatementsContainer
            poll={initPoll}
            user={defaultUser}
            filter={'all'}
            followees={defaultFollowees}
          />,
        ),
      )
      .toJSON();

    expect(wrapper).toMatchSnapshot();
  });
  it('Merges new Statements from feed correctly', () => {
    let store = mockStore(initialState);
    let wrapper = renderer
      .create(
        setupApp(
          store,
          <StatementsContainer
            poll={initPoll}
            user={defaultUser}
            filter={'all'}
            followees={defaultFollowees}
          />,
        ),
      )
      .toJSON();
    let asString = JSON.stringify(wrapper);
    expect(asString).toMatch(/before/);

    // change statement
    const updatedState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        statements: {
          ...initialState.entities.statements,
          byId: {
            ...initialState.entities.statements.byId,
            3: {
              __typename: 'StatementDL',
              id: '3',
              likes: 0,
              text: 'after',
              pollId: '1',
              createdAt: 'Sat Jul 29 2017 23:52:50 GMT+0200 (CEST)',
              updatedAt: null,
              vote: '2',
              author: '2',
            },
          },
          byPoll: {
            1: {
              all: [3, 2, 1],
            },
          },
        },
      },
    };
    store = mockStore(updatedState);
    wrapper = renderer
      .create(
        setupApp(
          store,
          <StatementsContainer
            poll={initPoll}
            user={defaultUser}
            filter={'all'}
            followees={defaultFollowees}
          />,
        ),
      )
      .toJSON();
    asString = JSON.stringify(wrapper);
    expect(asString).not.toMatch(/before/);
    expect(asString).toMatch(/after/);
  });
});
