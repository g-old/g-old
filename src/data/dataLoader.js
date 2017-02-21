import DataLoader from 'dataloader';
import knex from './knex';

// TODO parallelize requests with Promise.all()
const getUsersById = (userIds) =>
  new Promise((resolve) => {
    knex('users')
    .whereIn('id', userIds)
    .select()
    .then(data => resolve(userIds.map(
      // eslint-disable-next-line eqeqeq
      id => data.find(row => row.id == id) || new Error(`Row not found: ${id}`)),
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
      continue;  // eslint-disable-line no-continue
    }
    store[data[i].follower_id].push(data[i].followee_id);
  }
  // eslint-disable-next-line arrow-body-style
  const result = requestedIds.map(ids => { return store[ids] ? store[ids] : []; });
  return result;
}

const getFolloweeIds = (followerIds) =>
     Promise.resolve(knex('user_follows')
    .whereIn('follower_id', followerIds).select('followee_id', 'follower_id')
    .then(ids => groupFollowers(ids, followerIds)));

const getRolesById = (roleIds) =>
   new Promise((resolve) => {
     knex('roles')
     .whereIn('id', roleIds)
     .select()
     .then(data => resolve(roleIds.map(
       // eslint-disable-next-line eqeqeq
       id => data.find(row => row.id == id) || new Error(`Row not found: ${id}`)),
       ));
   });

function createLoaders() {
  return {
    users: new DataLoader(ids => getUsersById(ids)),
    followees: new DataLoader(ids => getFolloweeIds(ids)),
    roles: new DataLoader(ids => getRolesById(ids)),
  };
}

export default createLoaders;
