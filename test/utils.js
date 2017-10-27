/* eslint-disable import/prefer-default-export */
import knex from '../src/data/knex';
import { Groups, calcRights } from '../src/organization';

const uniqueData = () => {
  let i = 0;
  /* eslint-disable no-plusplus */
  return {
    email: () => `testemail${i++}@example.com`,
    wt: () => `WorkTeam ${i++}`,
  };
};
/* eslint-enable no-plusplus */

const getUnique = uniqueData();

export const clearDB = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw Error('Use only in testing environments!');
  }
  const tablesnames = await knex('pg_tables')
    .where('schemaname', '=', 'public')
    .pluck('tablename');
  const tables = tablesnames.filter(t => t.match('knex') === null);

  const promises = tables.map(table =>
    knex.raw(`truncate table ${table} cascade`),
  );
  return Promise.all(promises);
};

const createUser = args => ({
  name: args.name || 'Test',
  surname: args.surname || 'TestTest',
  email: args.email || getUnique.email(),
  groups: args.groups || Groups.GUEST,
});
export const createTestUser = (args = { groups: Groups.GUEST }) => ({
  ...createUser(args),
  ...(args.id && { id: args.id }),
  can_vote_since: args.canVoteSince || null,
  email_verified: args.emailVerified || false,
  thumbnail: args.thumbnail || '',
  last_login_at: args.lastLogin || null,
});

export const createTestActor = (args = { groups: Groups.GUEST }) => {
  const rights = calcRights(args.groups || Groups.GUEST);
  /* eslint-disable no-bitwise */
  return {
    ...createUser(args),
    id: args.id || 9999,
    privileges: args.privileges ? rights.priv | args.privileges : rights.priv,
    permissions: args.permissions
      ? rights.perm | args.permissions
      : rights.perm,
    canVoteSince: args.canVoteSince || null,
    emailVerified: args.emailVerified || false,
    avatar: args.avatar || '',
    lastLogin: args.lastLogin || null,
  };
  /* eslint-enable no-bitwise */
};

export const createPollingMode = (args = { mode: 'proposed' }) => {
  switch (args.mode) {
    case 'proposed': {
      return {
        ...(args.id && { id: args.id }),
        name: 'propose',
        unipolar: true,
        with_statements: false,
        threshold_ref: 'all',
      };
    }
    case 'voting': {
      return {
        ...(args.id && { id: args.id }),

        name: 'vote',
        unipolar: false,
        with_statements: true,
        threshold_ref: 'voters',
      };
    }
    case 'survey': {
      return {
        ...(args.id && { id: args.id }),

        name: 'survey',
        unipolar: false,
        with_statements: false,
        threshold_ref: 'voters',
      };
    }

    default:
      throw Error('Mode wrong');
  }
};
export const createPoll = (args = {}) => {
  const time = new Date();
  const endTime = new Date();
  endTime.setDate(time.getDate() + args.endTime || 3);
  return {
    ...(args.id && { id: args.id }),
    secret: args.secret || false,
    threshold: args.threshold || 25,
    created_at: args.createdAt || new Date(),
    updated_at: args.updatedAt || null,
    start_time: args.startTime || new Date(),
    end_time: endTime,
    num_voter: args.numVoter || 1,
    polling_mode_id: args.modeId,
  };
};
//
export const createProposal = (args = { state: 'proposed' }) => ({
  ...(args.id && { id: args.id }),
  author_id: args.authorId,
  poll_one_id: args.pollOneId || 22,
  poll_two_id: args.pollTwoId || null,
  title: 'title',
  body: 'body',
  created_at: args.createdAt || new Date(),
  state: args.state,
});

export const createStatement = args => ({
  ...(args.id && { id: args.id }),
  author_id: args.authorId,
  body: args.body || 'statementtext',
  vote_id: args.voteId,
  poll_id: args.pollId,
  position: args.position || 'pro',
  deleted_at: args.deletedAt || null,
  created_at: args.createdAt || new Date(),
  updated_at: args.updatedAt || null,
});

export const createWorkTeam = args => ({
  ...(args.id && { id: args.id }),
  coordinator_id: args.coordinatorId || 1,
  name: args.name || getUnique.wt(),
  created_at: args.createdAt || new Date(),
  updated_at: args.updatedAt || null,
});
