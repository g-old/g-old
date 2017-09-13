import { GraphQLObjectType, GraphQLInt } from 'graphql';
import cloudinary from 'cloudinary';
import os from 'os';

import DBInfoType from '../types/DBInfoType';
import BucketInfoType from '../types/BucketInfoType';
import ServerInfoType from '../types/ServerInfoType';
import knex from '../knex';

let bucketResult;
let lastFetchTime = new Date(1970, 0, 1);
let lastFetchTask;

const statistics = {
  type: new GraphQLObjectType({
    name: 'Statistics',
    fields: {
      usersOnline: {
        type: GraphQLInt,
        resolve() {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return knex('users')
            .where('last_login_at', '>', yesterday)
            .count('id')
            .then(res => res[0].count);
        },
      },
      db: {
        type: DBInfoType,
        resolve() {
          return {};
        },
      },
      bucket: {
        type: BucketInfoType,
        resolve() {
          if (lastFetchTask) {
            return lastFetchTask;
          }
          if (new Date() - lastFetchTime > 1000 * 60 * 10 /* 10 mins */) {
            lastFetchTime = new Date();

            lastFetchTask = new Promise((resolve, reject) => {
              cloudinary.v2.api.usage(
                (error, result) => (error ? reject(error) : resolve(result)),
              );
            })
              .then(data => {
                if (data) {
                  bucketResult = data;
                  lastFetchTask = null;
                }
                return bucketResult;
              })
              .catch(err => {
                lastFetchTask = null;
                throw err;
              });

            return lastFetchTask;
          }
          return bucketResult;
        },
      },
      server: {
        type: ServerInfoType,
        resolve() {
          return {
            numCpus: os.cpus().length,
            loadAvg: os.loadavg(),
            memory: [os.totalmem(), os.freemem()],
            uptime: os.uptime(),
          };
        },
      },
    },
  }),
  resolve() {
    return {};
  },
};

export default statistics;
