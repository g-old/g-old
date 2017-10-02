import Proposal from './Proposal';
import { Permissions } from '../../organization';
/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

const mockLoader = {
  proposals: {
    load: () =>
      Promise.resolve({
        title: 'Title',
        body: 'Some text',
        state: 'proposed',
        poll_one_id: 1,
        created_at: new Date(),
      }),
  },
  polls: { load: () => Promise.resolve({ id: '1', polling_mode_id: 1 }) },
  pollingModes: {
    load: () => Promise.resolve({ id: 1, threshold_ref: 'all' }),
  },
};

describe('Proposal', () => {
  it('Should return   a proposal to a user', async () => {
    const viewer = { id: 1, permissions: Permissions.VIEW_PROPOSALS };
    const proposal = await Proposal.gen(viewer, 1, mockLoader);
    expect(proposal.body).toBe('Some text');
  });
  it('Should not be votable if vote rights where not assigned at the start ', async () => {
    const viewer = {
      id: 1,
      permissions: Permissions.VIEW_PROPOSALS,
      canVoteSince: 0,
    };
    const proposal = await Proposal.gen(viewer, 1, mockLoader);
    expect(proposal.isVotable(viewer)).toBe(false);
  });
});
