/* @flow */

import PollingMode from './PollingMode';
import Poll from './Poll';

export const computeNextState = (
  state: ProposalStateType,
  poll: Poll,
  tRef: number,
) => {
  let newState;
  let ref;
  // TODO !! in case of extended
  if (poll.extended) {
    return state;
    // what to do?
    // cases survey: state survey
    // state proposed :  not possible?
    // state voting : state voting : copy wining option as proposal
  }
  switch (tRef) {
    case 'voters':
      ref = poll.options[0].numVotes + poll.options[1].numVotes;
      break;
    case 'all':
      ref = poll.numVoter;
      break;

    default:
      throw Error(`Threshold reference not implemented: ${tRef}`);
  }

  ref *= poll.threshold / 100;

  if (poll.options[0].numVotes >= ref) {
    switch (state) {
      case 'proposed': {
        newState = 'proposed';
        break;
      }
      case 'voting': {
        newState = 'accepted';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  } else {
    switch (state) {
      case 'proposed': {
        newState = 'accepted';
        break;
      }
      case 'voting': {
        newState = 'rejected';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  }

  return newState;
};

export async function closePoll(viewer, id, loaders, trx) {
  const poll = await Poll.gen(viewer, id, loaders);
  if (!poll) {
    throw new Error('Could not load poll');
  }
  if (!poll.closedAt) {
    const updatedPoll = await Poll.update(
      viewer,
      { id, closedAt: new Date() },
      loaders,
      trx,
    );
    if (!updatedPoll) {
      throw new Error('Could not update poll');
    }
  }
}

export class StateTransitionHelper {
  viewer: ViewerShape;

  newState: ProposalStateType;

  trx: Transaction;

  poll: Poll;

  loaders: DataLoaders;

  constructor(props) {
    this.viewer = props.viewer;
    this.newState = props.newState;
    this.trx = props.trx;
    this.poll = props.activePoll;
    this.loaders = props.loaders;
  }

  pollIsReady(proposal) {
    return !proposal.deletedAt && !this.poll.closedAt; // active poll must be open
  }

  async checkNextState(proposal, pollingMode) {
    const transitionResult = computeNextState(
      proposal.state,
      this.poll,
      pollingMode.thresholdRef,
    );
    return this.newState === transitionResult;
  }

  async getPollingMode() {
    return PollingMode.gen(
      this.viewer,
      this.poll.pollingModeId,
      this.loaders,
      this.trx,
    );
  }

  async canTransition(proposal) {
    if (this.pollIsReady(proposal)) {
      if (this.newState === 'revoked') {
        return true;
      }
      const pollingMode = await this.getPollingMode();
      if (!pollingMode) {
        throw new Error('Could not load pollingMode');
      }
      // don't allow double closing of phase2only proposals
      if (proposal.pollTwoId && this.newState === 'voting') {
        return false;
      }
      return this.checkNextState(proposal, pollingMode);
    }

    return false;
  }

  async closePoll(pollId) {
    return closePoll(this.viewer, pollId, this.loaders, this.trx);
  }

  async closeOpenPolls(proposal) {
    if (proposal.pollOneId) {
      await this.closePoll(proposal.pollOneId);
    }
    if (proposal.pollTwoId) {
      await this.closePoll(proposal.pollTwoId);
    }
  }

  async createNextPoll(pollData) {
    if (!pollData || !pollData.mode) {
      throw new Error('Poll data is missing');
    }
    const pollingMode = await PollingMode.createOrGet(
      this.viewer,
      pollData.mode,
      this.loaders,
      this.trx,
    );
    if (!pollingMode) throw Error('PollingMode failed');
    const newPoll = await Poll.create(
      this.viewer,
      { ...pollData, pollingModeId: pollingMode.id },
      this.loaders,
      this.trx,
    );
    if (!newPoll) {
      throw new Error('Could not create poll');
    }
    return newPoll;
  }
}
