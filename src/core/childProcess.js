import cp from 'child_process';
import log from '../logger';

let initialized = false;
let worker = null;

const handleResults = msg => {
  log.info(msg);
};

const fork = async file => {
  log.info('Creating background worker');
  if (!initialized) {
    worker = await cp.fork(file);
    if (worker) {
      worker.on('message', handleResults);
      // Listen for an exit event:
      worker.on('exit', exitCode => {
        log.error({ exitCode }, 'Worker terminated!');
        if (initialized) {
          initialized = false;
          // Restart
          fork(file);
        }
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

const init = async file => {
  /* when the process exits, we need to stop the worker */
  process.on('exit', exitCode => {
    log.error({ exitCode }, 'Server closing down, stopping worker');
    if (worker) worker.kill(exitCode);
    initialized = false;
  });

  /* to make sure we get the 'exit' signal when the process dies */
  process.on('SIGTERM', exitCode => {
    log.error({ exitCode }, 'SIGTERM received');
    process.exit(exitCode);
  });
  process.on('SIGINT', exitCode => {
    log.error({ exitCode }, 'SIGINT received');
    process.exit(exitCode);
  });

  /* start the actual worker */
  await fork(file);
};

export const sendJob = ({ type, data, viewer }) => {
  let result = false;
  if (initialized && worker) {
    const sent = worker.send({ type, data, viewer });
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

export default { start: path => init(path) };
