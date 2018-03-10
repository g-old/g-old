import DataLoader from 'dataloader';
import knex from './knex';

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
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getProposalsById = proposalIds =>
  new Promise(resolve => {
    knex('proposals')
      .whereIn('id', proposalIds)
      .select()
      .then(data =>
        resolve(
          proposalIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getProposalsByPollId = pollIds =>
  new Promise(resolve => {
    knex('proposals')
      .whereIn('poll_one_id', pollIds)
      .orWhereIn('poll_two_id', pollIds)
      .select()
      .then(data =>
        resolve(
          pollIds.map(
            id =>
              data.find(
                row => row.poll_one_id == id || row.poll_two_id == id, // eslint-disable-line eqeqeq
              ) || new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getPollsById = pollIds =>
  new Promise(resolve => {
    knex('polls')
      .whereIn('id', pollIds)
      .select()
      .then(data =>
        resolve(
          pollIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });
const getVotesById = voteIds =>
  new Promise(resolve => {
    knex('votes')
      .whereIn('id', voteIds)
      .select()
      .then(data =>
        resolve(
          voteIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

const getStatementsById = statementIds =>
  new Promise(resolve => {
    knex('statements')
      .whereIn('id', statementIds)
      .select()
      .then(data =>
        resolve(
          statementIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
      );
  });

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
  new Promise(resolve => {
    knex('activities')
      .whereIn('id', activityIds)
      .select()
      .then(data =>
        resolve(
          activityIds.map(
            id =>
              data.find(row => row.id == id) || // eslint-disable-line eqeqeq
              new Error(`Row not found: ${id}`),
          ),
        ),
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

const getGroupsById = groupIds =>
  new Promise(resolve => {
    knex('groups')
      .whereIn('id', groupIds)
      .select()
      .then(data =>
        resolve(
          groupIds.map(
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
    groups: new DataLoader(ids => getGroupsById(ids)),
  };
}

export default createLoaders;
