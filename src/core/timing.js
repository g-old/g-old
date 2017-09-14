// https://github.com/jshttp/on-headers/blob/master/index.js
/* eslint-disable prefer-rest-params */
import log from '../logger';

function setHeadersFromObject(res, headers) {
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    if (k) res.setHeader(k, headers[k]);
  }
}

function setHeadersFromArray(res, headers) {
  for (let i = 0; i < headers.length; i += 1) {
    res.setHeader(headers[i][0], headers[i][1]);
  }
}

function setWriteHeaders(statusCode) {
  const length = arguments.length;
  const headerIndex = length > 1 && typeof arguments[1] === 'string' ? 2 : 1;

  const headers =
    length >= headerIndex + 1 ? arguments[headerIndex] : undefined;

  this.statusCode = statusCode;

  if (Array.isArray(headers)) {
    // handle array case
    setHeadersFromArray(this, headers);
  } else if (headers) {
    // handle object case
    setHeadersFromObject(this, headers);
  }

  // copy leading arguments
  const args = new Array(Math.min(length, headerIndex));
  for (let i = 0; i < args.length; i += 1) {
    args[i] = arguments[i];
  }

  return args;
}

function createWriteHeader(prevWriteHeader, cb) {
  let fired = false;
  // eslint-disable-next-line no-unused-vars
  return function writeHeader(statusCode) {
    const args = setWriteHeaders.apply(this, arguments);
    if (!fired) {
      fired = true;
      cb.call(this);

      // pass-along an updated status code
      if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
        args[0] = this.statusCode;
        args.length = 1;
      }
    }
    prevWriteHeader.apply(this, args);
  };
}

function beforeHeadersSent(res, cb) {
  res.writeHead = createWriteHeader(res.writeHead, cb);
}

function timing() {
  return function responseTime(req, res, next) {
    const startTime = process.hrtime();
    // set cb

    beforeHeadersSent(res, () => {
      const diff = process.hrtime(startTime);
      const timePassed = diff[0] * 1e3 + diff[1] * 1e-6;
      let query;
      if (req.body && req.body.query) {
        query =
          typeof req.body.query === 'string'
            ? req.body.query.match(/{\S*\s+(\S+)/)[1]
            : '';
      }
      log.info({
        time: new Date(),
        method: req.method,
        path: req.originalUrl,
        timing: timePassed,
        query,
      }); // `${req.method} ${req.originalUrl} ${query} ${time}`);
    });

    return next();
  };
}

export default timing;
