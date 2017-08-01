import Proposal from './Proposal';
/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

const mockLoader = {
  proposals: {
    load: () =>
      Promise.resolve({ title: 'Title', body: 'Some text', state: 'proposed', poll_one_id: 1 }),
  },
  polls: { load: () => Promise.resolve({ id: '1', polling_mode_id: 1 }) },
  pollingModes: { load: () => Promise.resolve({ id: 1, threshold_ref: 'all' }) },
};

describe('Proposal.gen', () => {
  test('Return a proposal to a user', async () => {
    const viewer = { id: 1, role: { type: 'user' } };
    const proposal = await Proposal.gen(viewer, 1, mockLoader);
    expect(proposal.body).toBe('Some text');
  });
});
