import { validate, execute, parse } from 'graphql';
import { EventEmitter } from 'events';
import log from '../logger';
import { canAccess } from '../organization';
import EventManager from './EventManager';
// import { getArgumentValues } from 'graphql/execution/values';
// import { createAsyncIterator, forAwaitEach, isAsyncIterable } from 'iterall';

// inspired by graphql-subscriptions and subscription-transport-sse: https://github.com/mikebild/subscriptions-transport-sse

class ValidationError extends Error {
  constructor(errors) {
    super();
    this.errors = errors;
    this.message = 'Subscription query has validation errors';
  }
}

const HEART_BEAT = 30000;

export class SubscriptionManager {
  constructor(options) {
    this.schema = options.schema;
    this.subscriptions = {};
    this.pubsub = options.pubsub;
    this.maxSubscriptionId = 0;
    EventManager.subscribe('onActivityCreated', payload => {
      if (['proposal'].includes(payload.activity.type)) {
        this.pubsub.publish('activities', { id: payload.activity.id });
      }
    });
  }

  publish(triggerName, payload) {
    this.pubsub.publish(triggerName, payload);
  }

  subscribe(options) {
    const parsedQuery = parse(options.query);
    const errors = validate(this.schema, parsedQuery);
    if (errors.length) {
      Promise.reject(new ValidationError(errors));
    }

    // let args = {};
    let subscriptionName = '';
    this.maxSubscriptionId = this.maxSubscriptionId + 1;
    const externalSubscriptionId = this.maxSubscriptionId;

    parsedQuery.definitions.forEach(definition => {
      if (definition.kind === 'OperationDefinition') {
        const rootField = definition.selectionSet.selections[0];
        subscriptionName = rootField.name.value;
        // only used fpr specific subs
        // const fields = this.schema.getSubscriptionType().getFields();
        //  args = getArgumentValues(fields[subscriptionName], rootField, options.variables);
      }
    });

    const onMessage = rootValue =>
      Promise.resolve(options.context)
        .then(context => {
          execute(
            this.schema,
            parsedQuery,
            rootValue,
            context,
            options.variables,
            options.operationName,
          ).then(data => options.callback(null, data));
        })
        .catch(error => options.callback(error));

    return this.pubsub.subscribe(subscriptionName, onMessage).then(id => {
      this.subscriptions[externalSubscriptionId] = id;
      return externalSubscriptionId;
    });
  }

  unsubscribe(subId) {
    this.pubsub.unsubscribe(this.subscriptions[subId]);
    delete this.subscriptions[subId];
  }
}

/*
export class SubscriptionServer {
  constructor(options) {
    (this.schema = options.schema), (this.rootValue = options.rootValue), (this.execute =
      options.execute), (this.subscribe = options.subscribe), (this.onOperation =
      options.onOperation), (this.subscriptions = {});
    options.express.post(options.path, (req, res) => {
      // subscribe
      const connectionContext = {};

      return (message) => {
        const baseParams = {
          query: req.params.query,
          variables: req.params.variables,
          operationName: req.params.operationName,
          context: {},
        };

        const promisedParams = Promise.resolve(baseParams);
        // connectionContext.operations[opId] = createEmptyIterable();
        const document = parse(req.params.query);
        const executionIterable = this.subscribe(
          this.schema,
          document,
          this.rootValue,
          options.context,
          req.params.variables,
          req.param.operationName,
        );

        forAwaitEach(createAsyncIterator(executionIterable), (value) => {
          this.sendMessage();
        }).then(() => {});
      };
    });
  }
}
 */
export function SubscriptionServer(options) {
  const ee = new EventEmitter();
  ee.setMaxListeners(0);

  options.express.post(options.path, (req, res) => {
    if (!canAccess(req.user, 'SSE')) {
      return res.status(404).json({ error: 'Not authorized' });
    }
    // subscribe
    const subscription = Object.assign({}, req.body, options.onSubscribe());
    subscription.context = { ...subscription.context, viewer: req.user };
    let connectionSubId = 0;
    subscription.callback = (error, data) => {
      //  ee.emit('pushme', error, data);
      ee.emit(`e-${connectionSubId}`, error, data);
    };

    return options.subscriptionManager.subscribe(subscription).then(subId => {
      connectionSubId = subId;
      res.status(200).json({ subId });
    });
  });

  options.express.get(`${options.path}/:id`, (req, res) => {
    if (!canAccess(req.user, 'SSE')) {
      return res.status(404).json({ error: 'Not authorized' });
    }
    const connectionSubId = req.params.id;
    if (
      !connectionSubId ||
      !options.subscriptionManager.subscriptions[connectionSubId]
    ) {
      return res.status(404).json({ error: 'Not authorized' });
    }
    res.setHeader('Content-Type', 'text/event-stream');
    function listenerCallback(error, data) {
      res.write(
        `data: ${JSON.stringify({
          type: 'DATA',
          subId: connectionSubId,
          data: data.data,
        })}\n\n`,
      );
    }
    req.connection.on('close', () => {
      if (options.subscriptionManager.subscriptions[connectionSubId]) {
        options.subscriptionManager.unsubscribe(connectionSubId);
      }

      // remove listener;
      ee.removeListener(`e-${connectionSubId}`, listenerCallback);
    });

    req.connection.on('error', err => {
      if (err) {
        log.error({ err }, 'SSE connection error');
        res.end();
      }
    });

    /*  ee.on(`e-${connectionSubId}`, (error, data) => {
      res.write(
        `data: ${JSON.stringify({ type: 'DATA', subId: connectionSubId, data: data.data })}\n\n`,
      );
    }); */
    ee.on(`e-${connectionSubId}`, listenerCallback);

    const keepAliveTimer = setInterval(() => {
      if (req.connection.readyState === 'open') {
        res.write(
          `data: ${JSON.stringify({
            type: 'KEEPALIVE',
            subId: connectionSubId,
          })}\n\n`,
        );
      } else {
        clearInterval(keepAliveTimer);
      }
    }, HEART_BEAT);
    return res.write(
      `data: ${JSON.stringify({
        type: 'SUCCESS',
        subId: connectionSubId,
      })}\n\n`,
    );
  });
}
