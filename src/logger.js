const bunyan = require('bunyan');

/* eslint-disable comma-dangle */
const log = bunyan.createLogger({
  name: 'gold',
  serializers: bunyan.stdSerializers,
  streams: [
    {
      level: 'info',
      stream: process.stdout, // log INFO and above to stdout - path: '...' if file
    },
  ]
});
module.exports = log;
