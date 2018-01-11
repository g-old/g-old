/* eslint-env jest */

import ActivityService from './ActivityService';

const mockConnector = a => a;
const mockEventSrc = store => ({
  subscribe: name => {
    store.push(name);
  },
});
const mockStore = a => a;
describe('ActivityService', () => {
  it('Should register on events', () => {
    const events = [];
    const options = [
      {
        resourceName: 'proposal',
        events: [
          { eventType: 'create', mainFeed: true, systemFeed: true },
          { eventType: 'update', mainFeed: true, systemFeed: true },
        ],
      },
    ];
    // eslint-disable-next-line no-unused-vars
    const service = new ActivityService(
      {
        dbConnector: mockConnector,
        eventSrc: mockEventSrc(events),
        activityStore: mockStore,
      },
      options,
    );

    expect(events).toContain('onProposalCreated', 'onProposalUpdated');
  });
});
