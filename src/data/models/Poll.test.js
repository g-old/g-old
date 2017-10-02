/* eslint-env jest */
import Poll from './Poll';
import { Permissions } from '../../organization';

const mockLoader = {
  polls: {
    load: () =>
      Promise.resolve({
        id: '1',
        polling_mode_id: 1,
        end_time: new Date(null),
      }),
  },
  pollingModes: {
    load: () => Promise.resolve({ id: 1, threshold_ref: 'all' }),
  },
};
const viewer = { id: 1, permissions: Permissions.VIEW_PROPOSALS };
describe('Poll', () => {
  it('Should not be votable if endTime is expired', async () => {
    const poll = await Poll.gen(viewer, 1, mockLoader);
    expect(poll.isVotable()).toBe(false);
  });
});
