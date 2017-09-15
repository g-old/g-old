import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import cloudinary from 'cloudinary';
import os from 'os';
// import lastLines from 'read-last-lines';
import lineReader from 'reverse-line-reader';
// import pump from 'pump';
import DBInfoType from '../types/DBInfoType';
import BucketInfoType from '../types/BucketInfoType';
import ServerInfoType from '../types/ServerInfoType';
import RoutePerformance from '../types/RoutePerformance';
import knex from '../knex';

let bucketResult;
let lastFetchTime = new Date(1970, 0, 1);
let lastFetchTask;

let performanceResult;
let lastCalcTime = new Date(1970, 0, 1);
let lastCalcTask;

const readLogBackwards = (path, hours) => {
  const timings = [];
  let parsedLog;
  const yesterday = new Date() - 1000 * 60 * 60 * hours;
  return new Promise((resolve, reject) => {
    try {
      lineReader.eachLine(path, line => {
        if (line && line[0] === '{') {
          try {
            parsedLog = JSON.parse(line);
          } catch (e) {
            return true;
          }
          if (parsedLog && parsedLog.time) {
            if (new Date(parsedLog.time) > yesterday) {
              if (parsedLog.timing) {
                timings.push(parsedLog);
              }
              return true;
            }
            resolve(timings);
            return false; // to old, stop;
          }
        }
        return true;
      });
    } catch (e) {
      reject(e);
    }
  });
};

const aggregateTimings = routeData =>
  Object.keys(routeData).reduce((acc, curr) => {
    const data = routeData[curr];
    let type;
    switch (curr) {
      case 'mainPage':
      case 'feedPage': {
        type = 'SSE';
        break;
      }
      case 'voting':
      case 'statements':
      case 'likes': {
        type = 'mutation';
        break;
      }
      case 'proposal':
      case 'proposals':
      case 'feed':
      case 'logs':
      case 'user': {
        type = 'gQL';
        break;
      }
      case 'login':
      case 'logout': {
        type = 'query';
        break;
      }

      default: {
        type = 'asset';
      }
    }
    let sum;
    let median;
    if (data.length) {
      // eslint-disable-next-line no-param-reassign
      sum = data.reduce((previous, current) => (current += previous));
      data.sort((a, b) => a - b);
      const lowMiddle = Math.floor((data.length - 1) / 2);
      const highMiddle = Math.ceil((data.length - 1) / 2);
      median = (data[lowMiddle] + data[highMiddle]) / 2;
    }
    acc.push({
      type,
      avgTime: sum ? sum / data.length : null,
      numRequests: data.length,
      resource: curr,
      medianTime: median,
    });
    return acc;
  }, []);

/* function createLogParser(resolve, reject, logs) {
  const parser = split('\n', input => {
    if (!input) {
      return undefined;
    }
    if (input[0] !== '{') {
      return undefined;
    }
    // don't emit on trailing or keep alive new lines
    try {
      return JSON.parse(input);
    } catch (e) {
      return undefined;
    }
  });
  parser.on('data', entry => {
    if (entry.query) {
      logs.push(entry);
    }
  });
  parser.on('end', () => {
    console.log('PARSER IS ENDING');
    parser.destroy();
    resolve(logs);
  });
  parser.on('error', () => {
    console.log('PARSER Error');
    parser.destroy();
    reject(logs);
  });
  return parser;
}
*/
/* function readLogFile(path) {
  console.log('READING LOGILE....');
  return new Promise((resolve, reject) => {
    const readableLogs = [];

    const logStream = fs.createReadStream(path);
    pump(logStream, createLogParser(resolve, reject, readableLogs));
    logStream.on('error', e => {
      console.log('STREAM IS OPEN');
      reject(e);
    });
    //  .pipe(parseLines)
  });
}
*/
const reduceLogs = (timingLogs = []) =>
  timingLogs.reduce(
    (acc, currLog) => {
      if (currLog.query) {
        switch (currLog.query) {
          case 'proposalDL': {
            acc.proposal.push(currLog.timing);
            return acc;
          }
          case 'proposalConnection': {
            acc.proposals.push(currLog.timing);
            return acc;
          }
          case 'feed': {
            acc.feed.push(currLog.timing);
            return acc;
          }
          case 'logs': {
            acc.logs.push(currLog.timing);
            return acc;
          }
          case 'user': {
            acc.user.push(currLog.timing);
            return acc;
          }
          case 'createVote':
          case 'updateVote':
          case 'deleteVote': {
            acc.voting.push(currLog.timing);
            return acc;
          }

          case 'createStatementLike':
          case 'deleteStatementLike': {
            acc.likes.push(currLog.timing);
            return acc;
          }

          case 'createStatement':
          case 'updateStatement':
          case 'deleteStatement': {
            acc.statements.push(currLog.timing);
            return acc;
          }

          case 'intl': {
            acc.intl.push(currLog.timing);
            return acc;
          }

          default: {
            return acc;
          }
        }
      } else if (currLog.path) {
        switch (currLog.path) {
          case '/feed': {
            acc.feedPage.push(currLog.timing);
            return acc;
          }
          case '/': {
            acc.mainPage.push(currLog.timing);
            return acc;
          }

          case '/login': {
            acc.login.push(currLog.timing);
            return acc;
          }

          case '/logout': {
            acc.logout.push(currLog.timing);
            return acc;
          }

          default: {
            acc.assets.push(currLog.timing);
            return acc;
          }
        }
      }
      return acc;
    },
    {
      login: [],
      mainPage: [],
      feedPage: [],
      proposal: [],
      proposals: [],
      feed: [],
      logs: [],
      user: [],
      voting: [],
      statements: [],
      assets: [],
      likes: [],
      logout: [],
      intl: [],
    },
  );

// TODO checkout reverse line reader
/* function readLogFileReverse(path, numLines) {
  return lastLines.read(path, numLines).then(data => {
    let log;
    const yesterday = new Date() - 1000 * 60 * 60 * 24;
    return data.split('\n').reduce((acc, curr) => {
      if (curr[0] !== '{') {
        return acc;
      }
      try {
        log = JSON.parse(curr);

        if (log.query && new Date(log.time) > yesterday) {
          switch (log.query) {
            case 'proposalDL': {
              acc.proposal.push(log.timing);
              return acc;
            }
            case 'proposals': {
              acc.proposals.push(log.timing);
              return acc;
            }
            case 'feed': {
              acc.feed.push(log.timing);
              return acc;
            }
            case 'logs': {
              acc.logs.push(log.timing);
              return acc;
            }
            case 'user': {
              acc.user.push(log.timing);
              return acc;
            }
            case 'createVote':
            case 'updateVote':
            case 'deleteVote': {
              acc.voting.push(log.timing);
              return acc;
            }
            case 'createStatement':
            case 'updateStatement':
            case 'deleteStatement': {
              acc.statements.push(log.timing);
              return acc;
            }

            default: {
              acc.assets.push(log.timing);
              return acc;
            }
          }
        } else if (log.path && new Date(log.time) > yesterday) {
          switch (log.path) {
            case '/feed': {
              acc.feedPage.push(log.timing);
              return acc;
            }
            case '/': {
              acc.mainPage.push(log.timing);
              return acc;
            }

            default: {
              return acc;
            }
          }
        }
        return acc;
      } catch (e) {
        return acc;
      }
    }, {
      mainPage: [],
      feedPage: [],
      proposal: [],
      proposals: [],
      feed: [],
      logs: [],
      user: [],
      voting: [],
      statements: [],
      assets: [],
    });
  });
}
*/
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
      performance: {
        type: new GraphQLList(RoutePerformance),
        async resolve() {
          /*    return readLogBackwards(
            `${os.homedir()}/goldtest.log`,
            24,
          ).then(data => {
            console.log('DATA', data);
            console.log('DATA LENGTH', data.length);
            const d = reduceLogs(data);
            console.log('REDUCED', d);
            const f = aggregateTimings(d);
            return f;
          }); */

          if (lastCalcTask) {
            return lastCalcTask;
          }
          if (new Date() - lastCalcTime > 1000 * 60 * 60 * 1 /* 1h */) {
            lastCalcTime = new Date();
            const path = process.env.LOGFILE || '/var/log/gold.log'; // `${os.homedir()}/goldtest.log`;
            lastCalcTask = readLogBackwards(path, 24)
              .then(data => {
                if (data) {
                  const computed = aggregateTimings(reduceLogs(data));
                  performanceResult = computed;
                  lastCalcTask = null;
                }
                return performanceResult;
              })
              .catch(err => {
                lastCalcTask = null;
                throw err;
              });

            /*  lastCalcTask = readLogFileReverse(path, 1000)
              .then(data => {
                if (data) {
                  const computed = aggregateTimings(data);
                  performanceResult = computed;
                  lastCalcTask = null;
                }
                return performanceResult;
              })
              .catch(err => {
                lastCalcTask = null;
                throw err;
              }); */

            return lastCalcTask;
          }

          return performanceResult;
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
          if (new Date() - lastFetchTime > 1000 * 60 * 60 /* 1h */) {
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
