/* eslint-env jest */

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
  GraphQLString,
} from 'graphql';
import { SubscriptionManager } from '../sse';

describe('SubscriptionManager', () => {
  it('Should allow to subscribe', async () => {
    const mockSchema = new Schema({
      query: new ObjectType({
        name: 'Query',
        fields: {
          test: { type: GraphQLString },
        },
      }),
    });
    const mockPubsub = (listeners = []) => ({
      subscribe: (name, fn) => {
        listeners.push(fn);
        return Promise.resolve();
      },
    });

    const resultFn = (results = []) => (error, data) => {
      results.push(data);
    };
    const listeners = [];
    const manager = new SubscriptionManager({
      schema: mockSchema,
      pubsub: mockPubsub(listeners),
    });
    const mockQuery = 'query{test}';
    const results = [];
    const subId = await manager.subscribe({
      query: mockQuery,
      context: 'context',
      callback: resultFn(results),
    });

    expect(subId).toBe(1);
  });
});
