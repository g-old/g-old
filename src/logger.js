const bunyan = require('bunyan');

/* eslint-disable comma-dangle */

const userSerializer = (user) => {
  if (!user) {
    return user;
  }
  return { name: user.name, surname: user.surname };
};
const log = bunyan.createLogger({
  name: 'gold',
  serializers: {
    err: bunyan.stdSerializers.err,
    user: userSerializer,
    req: bunyan.stdSerializers.req,
  },
  streams: [
    {
      level: 'info',
      stream: process.stdout, // log INFO and above to stdout - path: '...' if file
    },
  ]
});
module.exports = log;
