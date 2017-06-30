import cp from 'child_process';
import log from '../logger';

let initialized = false;
let worker = null;

const handleResults = (msg) => {
  log.info(msg);
};

const fork = async (file) => {
  log.info('Creating background worker');
  if (!initialized) {
    worker = await cp.fork(file);
    if (worker) {
      worker.on('message', handleResults);
      // Listen for an exit event:
      worker.on('exit', (exitCode) => {
        log.error({ exitCode }, 'Worker terminated!');
        initialized = false;
        // Restart
        fork(file);
      });
      initialized = true;
    } else {
      log.fatal('Worker could not been forked');
      throw Error('Worker could not been forked');
    }
  } else {
    log.info({ worker }, 'Worker already initialized');
  }
};

export const sendJob = ({ type, data }) => {
  let result = false;
  if (initialized) {
    const sent = worker.send({ type, data });
    if (sent) {
      result = true;
    } else {
      log.error({ job: { type, data }, worker }, 'IPC to worker failed!');
    }
  } else {
    log.error({ job: { type, data }, worker }, 'Worker not started yet');
  }
  return result;
};

export default { start: path => fork(path) };
