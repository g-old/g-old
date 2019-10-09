import DataLoader from 'dataloader';
import knex from './knex';
import log from '../logger';

// TODO parallelize requests with Promise.all()
const getUsersById = userIds =>
  new Promise(resolve => {
    knex('users')
      .whereIn('id', userIds)
      .select()
      .then(data =>
        resolve(
          userIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

// TODO check if this behaviour can be achieved with SQL
/*
  To comply with DataLoader
  Groups each value from the pair by the key and returns an array with the same
  length and order of the request-array.
*/
/* eslint-disable eqeqeq */

function groupFollowers(data, requestedIds) {
  const store = {};
  for (let i = 0, l = data.length; i < l; i += 1) {
    if (!(data[i].follower_id in store)) {
      store[data[i].follower_id] = [data[i].followee_id];
      continue; // eslint-disable-line no-continue
    }
    store[data[i].follower_id].push(data[i].followee_id);
  }
  // eslint-disable-next-line arrow-body-style
  const result = requestedIds.map(ids => {
    return store[ids] ? store[ids] : [];
  });
  return result;
}

const getFolloweeIds = followerIds =>
  Promise.resolve(
    knex('user_follows')
      .whereIn('follower_id', followerIds)
      .select('followee_id', 'follower_id')
      .then(ids => groupFollowers(ids, followerIds)),
  );

const getRolesById = roleIds =>
  new Promise(resolve => {
    knex('roles')
      .whereIn('id', roleIds)
      .select()
      .then(data =>
        resolve(
          roleIds.map(
            id =>
              data.find(row => row.id == id) ||
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getProposalsById = proposalIds =>
  new Promise((resolve, reject) => {
    knex('proposals')
      .whereIn('id', proposalIds)
      .select()
      .then(
        data =>
          resolve(
            proposalIds.map(
              id =>
                data.find(row => row.id == id) ||
                new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });

const getProposalsByPollId = pollIds =>
  new Promise((resolve, reject) => {
    knex('proposals')
      .whereIn('poll_one_id', pollIds)
      .orWhereIn('poll_two_id', pollIds)
      .select()
      .then(
        data =>
          resolve(
            pollIds.map(
              id =>
                data.find(
                  row => row.poll_one_id == id || row.poll_two_id == id,
                ) || new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });

const getPollsById = pollIds =>
  new Promise((resolve, reject) => {
    knex('polls')
      .whereIn('id', pollIds)
      .select()
      .then(
        data =>
          resolve(
            pollIds.map(
              id =>
                data.find(row => row.id == id) ||
                new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });
const getVotesById = voteIds =>
  new Promise((resolve, reject) => {
    knex('votes')
      .whereIn('id', voteIds)
      .select()
      .then(
        data =>
          resolve(
            voteIds.map(
              id =>
                data.find(row => row.id == id) ||
                new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });

const getStatementsById = statementIds =>
  new Promise((resolve, reject) => {
    knex('statements')
      .whereIn('id', statementIds)
      .select()
      .then(
        data =>
          resolve(
            statementIds.map(
              id =>
                data.find(row => row.id == id) ||
                new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });

/* eslint-enable eqeqeq */

const getPollingModesById = pollingModeIds =>
  new Promise(resolve => {
    knex('polling_modes')
      .whereIn('id', pollingModeIds)
      .select()
      .then(data =>
        resolve(
          pollingModeIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getTagsById = tagIds =>
  new Promise(resolve => {
    knex('tags')
      .whereIn('id', tagIds)
      .select()
      .then(data =>
        resolve(
          tagIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getStatementLikesById = likeIds =>
  new Promise(resolve => {
    knex('statement_likes')
      .whereIn('id', likeIds)
      .select()
      .then(data =>
        resolve(
          likeIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getActivitiesById = activityIds =>
  new Promise((resolve, reject) => {
    knex('activities')
      .whereIn('id', activityIds)
      .select()
      .then(
        data =>
          resolve(
            activityIds.map(
              id =>
                // eslint-disable-next-line
                data.find(row => row.id == id) ||
                new Error(`Row not found: ${id}`),
            ),
          ),
        e => {
          reject(e);
        },
      );
  });

const getDiscussionsById = discussionIds =>
  new Promise(resolve => {
    knex('discussions')
      .whereIn('id', discussionIds)
      .select()
      .then(data =>
        resolve(
          discussionIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getWorkTeamsById = workTeamIds =>
  new Promise(resolve => {
    knex('work_teams')
      .whereIn('id', workTeamIds)
      .select()
      .then(data =>
        resolve(
          workTeamIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getCommentsById = commentIds =>
  new Promise(resolve => {
    knex('comments')
      .whereIn('id', commentIds)
      .select()
      .then(data =>
        resolve(
          commentIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getSubscriptionsById = subscriptionIds =>
  new Promise(resolve => {
    knex('subscriptions')
      .whereIn('id', subscriptionIds)
      .select()
      .then(data =>
        resolve(
          subscriptionIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getNotificationsById = notificationIds =>
  new Promise(resolve => {
    knex('notifications')
      .whereIn('id', notificationIds)
      .select()
      .then(data =>
        resolve(
          notificationIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });
const getNotesById = noteIds =>
  new Promise(resolve => {
    knex('notes')
      .whereIn('id', noteIds)
      .select()
      .then(
        data =>
          resolve(
            noteIds.map(
              id =>
                data.find(row => row.id == id) || // eslint-disable-line eqeqeq
                new Error(`Row not found: ${id}`),
            ),
          ),
        err => {
          log.error({ err }, 'Notes loading failed');
        },
      );
  });

const getCommunicationsById = communicationIds =>
  new Promise(resolve => {
    knex('communications')
      .whereIn('id', communicationIds)
      .select()
      .then(data =>
        resolve(
          communicationIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getMessagesById = messageIds =>
  new Promise(resolve => {
    knex('messages')
      .whereIn('id', messageIds)
      .select()
      .then(data =>
        resolve(
          messageIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });
const getVerificationsByUserId = userIds =>
  new Promise(resolve => {
    knex('verifications')
      .whereIn('user_id', userIds)
      .select()
      .then(data =>
        resolve(
          userIds.map(
            id =>
              data.find(row => row.user_id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

function createLoaders() {
  return {
    users: new DataLoader(ids => getUsersById(ids)),
    followees: new DataLoader(ids => getFolloweeIds(ids)),
    roles: new DataLoader(ids => getRolesById(ids)),
    proposals: new DataLoader(ids => getProposalsById(ids)),
    proposalsByPoll: new DataLoader(ids => getProposalsByPollId(ids)),
    polls: new DataLoader(ids => getPollsById(ids)),
    votes: new DataLoader(ids => getVotesById(ids)),
    statements: new DataLoader(ids => getStatementsById(ids)),
    pollingModes: new DataLoader(ids => getPollingModesById(ids)),
    tags: new DataLoader(ids => getTagsById(ids)),
    statementLikes: new DataLoader(ids => getStatementLikesById(ids)),
    activities: new DataLoader(ids => getActivitiesById(ids)),
    comments: new DataLoader(ids => getCommentsById(ids)),
    discussions: new DataLoader(ids => getDiscussionsById(ids)),
    workTeams: new DataLoader(ids => getWorkTeamsById(ids)),
    subscriptions: new DataLoader(ids => getSubscriptionsById(ids)),
    notifications: new DataLoader(ids => getNotificationsById(ids)),
    notes: new DataLoader(ids => getNotesById(ids)),
    communications: new DataLoader(ids => getCommunicationsById(ids)),
    messages: new DataLoader(ids => getMessagesById(ids)),
    verificationsByUser: new DataLoader(ids => getVerificationsByUserId(ids)),
  };
}

export default createLoaders;
