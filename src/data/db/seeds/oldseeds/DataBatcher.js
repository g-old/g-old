let resolvedPromise;

const failedDispatch = (loader, queue, error) => {
  queue.forEach(({ reject }) => {
    reject(error);
  });
};

const dispatchQueueBatch = (loader, queue) => {
  const dataChunk = queue.map(({ data }) => data);
  // eslint-disable-next-line prefer-destructuring
  const batchInsertFn = loader.batchInsertFn;
  const batchPromise = batchInsertFn(dataChunk);

  batchPromise
    .then(values => {
      queue.forEach(({ resolve, reject }, index) => {
        const value = values[index];
        if (value instanceof Error) {
          reject(value);
        } else {
          resolve(value);
        }
      });
    })
    .catch(error => failedDispatch(loader, queue, error));
};

const enqueuePostPromiseJob = fn => {
  if (!resolvedPromise) {
    resolvedPromise = Promise.resolve();
  }
  setTimeout(() => {
    resolvedPromise.then(() => process.nextTick(fn));
  }, 1000);
  // resolvedPromise.then(() => process.nextTick(fn));
};

const dispatchQueue = loader => {
  // eslint-disable-next-line prefer-destructuring
  const queue = loader.queue;
  // eslint-disable-next-line no-param-reassign
  loader.queue = [];
  dispatchQueueBatch(loader, queue);
};

class DataBatcher {
  constructor(batchInsertFn) {
    this.batchInsertFn = batchInsertFn;
    this.queue = [];
  }

  insert(data) {
    if (!data) {
      throw new TypeError('Must be called with data');
    }

    const promise = new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      if (this.queue.length === 1) {
        enqueuePostPromiseJob(() => dispatchQueue(this));
      }
    });
    return promise;
  }

  insertMany(data) {
    return Promise.all(data.map(d => this.insert(d)));
  }
}

module.exports = DataBatcher;
