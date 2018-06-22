import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import history from '../../history';
import { loadProposal } from '../../actions/proposal';
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
  getIsProposalFetching,
  getProposalErrorMessage,
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
});
class ProposalContainer extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      pollOne: PropTypes.shape({ mode: PropTypes.shape({}) }),
      pollTwo: PropTypes.shape({ mode: PropTypes.shape({}) }),
      id: PropTypes.string,
      subscribed: PropTypes.bool,
      subscription: PropTypes.shape({}),
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
    return (
      this.props.proposal &&
      ((this.props.proposal.pollOne && this.props.proposal.pollOne.mode) ||
        (this.props.proposal.pollTwo && this.props.proposal.pollTwo.mode))
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
    const { proposal } = this.props;
    switch (method) {
      case 'create': {
        let targetId;
        if (!proposal.subscription) {
          if (proposal.state !== 'survey') {
            targetId = this.props.proposal.id;
          }
        }
        this.props.createVote({ ...data, targetId });
        break;
      }
      case 'update': {
        this.props.updateVote(data, info);
        break;
      }
      case 'del': {
        this.props.deleteVote(data, info);
        break;
      }
      default:
        throw Error('Unknown method');
    }
  }
  handleSubscription({ targetType, subscriptionType }) {
    const { id, subscription } = this.props.proposal;
    if (subscription && subscriptionType === 'DELETE') {
      this.props.deleteSubscription({ id: subscription.id });
    } else if (subscription) {
      this.props.updateSubscription({
        id: subscription.id,
        targetType,
        subscriptionType,
        targetId: id,
      });
    } else {
      this.props.createSubscription({
        targetType,
        subscriptionType,
        targetId: id,
      });
    }
  }

  render() {
    const {
      proposal,
      isFetching,
      errorMessage,
      user,
      followees,
      subscriptionStatus,
    } = this.props;
    const showSubscription = ['proposed', 'voting'].includes(proposal.state);
    const { filter } = this.state;
    if (isFetching && !proposal) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !proposal) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => this.props.loadProposal({ id: this.props.proposalId })}
        />
      );
    }
    if (this.isReady()) {
      let poll;
      if (proposal.pollOne) {
        poll =
          proposal.pollOne.id === this.props.pollId
            ? proposal.pollOne
            : proposal.pollTwo;
      } else {
        poll = proposal.pollTwo;
      }
      const canSwitchPolls = !!(proposal.pollOne && proposal.pollTwo);
      if (!poll) {
        return <div>SOMETHING GOT REALLY WRONG</div>;
      }
      let switchPollBtn = null;

      if (canSwitchPolls) {
        const isPollOne = poll.id === proposal.pollOne.id;
        switchPollBtn = (
          <Button
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
      if (poll.mode && poll.mode.withStatements && !poll.mode.unipolar) {
        filterNode = (
          <Filter filter={filter} filterFn={this.filterStatements} />
        );
      }
      // return proposal, poll, statementslist
      return (
        <div>
          <Box column pad>
            <Proposal {...proposal} />
            {showSubscription && (
              <SubscriptionButton
                status={subscriptionStatus}
                targetType="PROPOSAL"
                onSubscribe={this.handleSubscription}
                subscription={proposal.subscription}
              />
            )}
            <Poll
              {...poll}
              canVote={proposal.canVote}
              onVote={this.handleVoting}
              onFetchVoters={this.props.getVotes}
              user={user}
              filter={this.state.filter}
              filterFn={this.filterStatements}
              updates={this.props.voteUpdates}
              followeeVotes={this.props.followeeVotes}
            />
            {filterNode}
            <StatementsContainer
              hideOwnStatement={hideOwnStatement}
              followees={followees}
              poll={poll}
              user={user}
              filter={this.state.filter}
            />
            {switchPollBtn}
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
  isFetching: getIsProposalFetching(state, proposalId),
  errorMessage: getProposalErrorMessage(state, proposalId),
  followees: getFollowees(state),
  voteUpdates: getVoteUpdates(state, pollId),
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

export default connect(mapStateToProps, mapDispatch)(ProposalContainer);
