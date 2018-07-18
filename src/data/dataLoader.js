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

function createLoaders() {
  return {
    users: new DataLoader(ids => getUsersById(ids)),
  };
}

export default createLoaders;
