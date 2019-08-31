import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import history from '../../history';
import { loadProposal } from '../../actions/proposal';
import Notification from '../../components/Notification';
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../../actions/subscription';
import {
  createVote,
  updateVote,
  deleteVote,
  getVotes,
} from '../../actions/vote';
import {
  getVoteUpdates,
  getProposal,
  getProposalUpdates,
  getFolloweeVotesByPoll,
  getFollowees,
  getSubscriptionUpdates,
} from '../../reducers';
import FetchError from '../../components/FetchError';
import StatementsContainer from '../../components/StatementsContainer';
import Proposal from '../../components/Proposal';
import Box from '../../components/Box';
import Button from '../../components/Button';
import Poll from '../../components/Poll';
import Filter from '../../components/Filter';
import SubscriptionButton from '../../components/SubscriptionButton';
import PollNotice from './PollNotice';
import ProposalState from '../../components/ProposalState';

function getCurrentPoll(proposal, pollId) {
  let poll;
  if (proposal.pollOne) {
    poll = proposal.pollOne.id === pollId ? proposal.pollOne : proposal.pollTwo;
  } else {
    poll = proposal.pollTwo;
  }
  return poll;
}
const messages = defineMessages({
  voting: {
    id: 'voting',
    defaultMessage: 'Voting',
    description: 'Switch to voting poll',
  },
  proposal: {
    id: 'proposal',
    defaultMessage: 'Proposal',
    description: 'Switch to proposal poll',
  },
  closed: {
    id: 'poll.closed',
    defaultMessage: 'Ended',
    description: 'Poll closing time',
  },
});
const PollShape = PropTypes.shape({
  id: PropTypes.number,
  mode: PropTypes.shape({}),
});
class ProposalContainer extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      pollOne: PollShape,
      pollTwo: PollShape,
      id: PropTypes.string,
      subscribed: PropTypes.bool,
      subscription: PropTypes.shape({ id: PropTypes.number }),
      state: PropTypes.string,
      deletedAt: PropTypes.string,
      canVote: PropTypes.bool,
    }).isRequired,
    user: PropTypes.shape({}).isRequired,
    proposalId: PropTypes.number.isRequired,
    isFetching: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    pollId: PropTypes.string.isRequired,
    createVote: PropTypes.func.isRequired,
    updateVote: PropTypes.func.isRequired,
    deleteVote: PropTypes.func.isRequired,
    loadProposal: PropTypes.func.isRequired,
    getVotes: PropTypes.func.isRequired,
    voteUpdates: PropTypes.shape({}).isRequired,
    followeeVotes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    followees: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    createSubscription: PropTypes.func.isRequired,
    deleteSubscription: PropTypes.func.isRequired,
    updateSubscription: PropTypes.func.isRequired,
    subscriptionStatus: PropTypes.shape({}),
    updates: PropTypes.shape({
      isFetching: PropTypes.bool,
      errorMessage: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    errorMessage: null,
    subscriptionStatus: null,
  };

  constructor(props) {
    super(props);
    this.state = { filter: 'all' };
    this.filterStatements = this.filterStatements.bind(this);
    this.handlePollSwitching = this.handlePollSwitching.bind(this);
    this.handleVoting = this.handleVoting.bind(this);
    this.handleSubscription = this.handleSubscription.bind(this);
  }

  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    const { proposal } = this.props;
    return (
      proposal &&
      ((proposal.pollOne && proposal.pollOne.mode) ||
        (proposal.pollTwo && proposal.pollTwo.mode))
    );
  }

  filterStatements(e, { filter }) {
    e.preventDefault();
    this.setState({ filter });
  }

  handlePollSwitching() {
    const { proposal, pollId } = this.props;
    let url = `/proposal/${proposal.id}/`;
    if (proposal.pollOne.id === pollId) {
      url += proposal.pollTwo.id;
    } else {
      url += proposal.pollOne.id;
    }
    history.push(url);
  }

  handleVoting(data, method, info) {
    const {
      proposal,
      createVote: vote,
      updateVote: mutateVote,
      deleteVote: eraseVote,
    } = this.props;
    switch (method) {
      case 'create': {
        let targetId;
        if (!proposal.subscription) {
          if (proposal.state !== 'survey') {
            targetId = proposal.id;
          }
        }
        vote({ ...data, targetId });
        break;
      }
      case 'update': {
        mutateVote(data, info);
        break;
      }
      case 'del': {
        eraseVote(data, info);
        break;
      }
      default:
        throw Error('Unknown method');
    }
  }

  // TODO make subscribe HOC

  handleSubscription({ targetType, subscriptionType }) {
    const {
      proposal: { id, subscription },
      deleteSubscription: unsubscribe,
      updateSubscription: mutateSubscription,
      createSubscription: subscribe,
    } = this.props;
    if (subscription && subscriptionType === 'DELETE') {
      unsubscribe({ id: subscription.id });
    } else if (subscription) {
      mutateSubscription({
        id: subscription.id,
        targetType,
        subscriptionType,
        targetId: id,
      });
    } else {
      subscribe({
        targetType,
        subscriptionType,
        targetId: id,
      });
    }
  }

  fetchProposal() {
    const { loadProposal: fetchProposal, proposalId } = this.props;
    fetchProposal({ id: proposalId });
  }

  renderInteractions() {
    const {
      proposal,
      followees,
      user,
      pollId,
      subscriptionStatus,
      getVotes: fetchVotes,
      voteUpdates,
      followeeVotes,
    } = this.props;
    if (proposal.deletedAt) {
      return null;
    }
    const showSubscription = ['proposed', 'voting'].includes(proposal.state);
    const { filter } = this.state;
    const poll = getCurrentPoll(proposal, pollId);
    const canSwitchPolls = !!(proposal.pollOne && proposal.pollTwo);
    if (!poll) {
      return <div>SOMETHING GOT REALLY WRONG</div>;
    }
    let switchPollBtn = null;

    if (canSwitchPolls) {
      const isPollOne = poll.id === proposal.pollOne.id;
      switchPollBtn = (
        <Button
          plain
          reverse={isPollOne}
          label={
            <FormattedMessage
              {...messages[isPollOne ? 'voting' : 'proposal']}
            />
          }
          icon={
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d="M2,12 L22,12 M13,3 L22,12 L13,21"
                transform={isPollOne ? null : 'matrix(-1 0 0 1 24 0)'}
              />
            </svg>
          }
          onClick={this.handlePollSwitching}
        />
      );
    }
    let hideOwnStatement = true;
    if (
      filter === 'all' ||
      (poll.ownVote && filter === poll.ownVote.position)
    ) {
      hideOwnStatement = false;
    }
    let filterNode = null;
    if (
      poll.mode &&
      poll.mode.withStatements &&
      !(poll.mode.unipolar || poll.extended)
    ) {
      filterNode = <Filter filter={filter} filterFn={this.filterStatements} />;
    }
    return (
      <React.Fragment>
        <Poll
          {...poll}
          canVote={proposal.canVote}
          onVote={this.handleVoting}
          onFetchVoters={fetchVotes}
          user={user}
          filter={filter}
          filterFn={this.filterStatements}
          updates={voteUpdates}
          followeeVotes={followeeVotes}
        />

        {
          <div
            style={{
              borderBottom: '1px solid #eee',
              paddingBottom: '2em',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {!poll.closedAt && <ProposalState state={proposal.state} />}
            {poll.closedAt && (
              <Box align>
                <ProposalState state={proposal.state} />{' '}
                <FormattedRelative value={parseInt(poll.closedAt, 10)} />
              </Box>
            )}
            {showSubscription && (
              <SubscriptionButton
                status={subscriptionStatus}
                targetType="PROPOSAL"
                onSubscribe={this.handleSubscription}
                subscription={proposal.subscription}
              />
            )}
          </div>
        }

        <StatementsContainer
          hideOwnStatement={hideOwnStatement}
          followees={followees}
          poll={poll}
          user={user}
          filter={filter}
        >
          {filterNode}
        </StatementsContainer>

        {switchPollBtn}
      </React.Fragment>
    );
  }

  render() {
    const { proposal, updates = {}, pollId } = this.props;
    if (updates.isFetching && !proposal) {
      return <p>{'Loading...'} </p>;
    }
    if (updates.errorMessage && !proposal) {
      return (
        <FetchError
          message={updates.errorMessage}
          onRetry={this.fetchProposal}
        />
      );
    }
    if (proposal.deletedAt) {
      return <Notification type="alert" message="Proposal not accessible!" />;
    }
    if (this.isReady()) {
      // return proposal, poll, statementslist
      const poll = getCurrentPoll(proposal, pollId);

      return (
        <div>
          <Box column padding="medium">
            {!poll.closedAt && <PollNotice poll={poll} />}
            <Proposal {...proposal} />
            {this.renderInteractions()}
          </Box>
        </div>
      ); // <TestProposal user={this.props.user} proposal={this.props.proposal} />;
    }
    return <div>STILL LOADING ...</div>;
  }
}
ProposalContainer.propTypes = {};
// TODO implement memoiziation with reselect

const mapStateToProps = (state, { pollId, proposalId }) => ({
  proposal: getProposal(state, proposalId),
  updates: getProposalUpdates(state, proposalId),
  followees: getFollowees(state),
  voteUpdates: getVoteUpdates(state),
  followeeVotes: getFolloweeVotesByPoll(state, pollId),
  subscriptionStatus: getSubscriptionUpdates(state),
});

const mapDispatch = {
  loadProposal,
  createVote,
  updateVote,
  deleteVote,
  getVotes,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(ProposalContainer);
