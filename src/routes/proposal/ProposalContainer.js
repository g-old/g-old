import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import history from '../../history';
import {
  loadProposal,
  createProposalSub,
  deleteProposalSub,
} from '../../actions/proposal';
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
} from '../../reducers';
import FetchError from '../../components/FetchError';
import StatementsContainer from '../../components/StatementsContainer';
import Proposal from '../../components/Proposal';
import Box from '../../components/Box';
import Button from '../../components/Button';
import Poll from '../../components/Poll';
import Filter from '../../components/Filter';
import CheckBox from '../../components/CheckBox';

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
      pollOne: PropTypes.shape({}),
      pollTwo: PropTypes.shape({}),
      id: PropTypes.string,
      subscribed: PropTypes.bool,
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
    createProposalSub: PropTypes.func.isRequired,
    deleteProposalSub: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errorMessage: null,
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
      (this.props.proposal.pollOne || this.props.proposal.pollTwo)
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
    switch (method) {
      case 'create': {
        this.props.createVote(data);
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
  handleSubscription() {
    const { subscribed, id } = this.props.proposal;
    if (subscribed) {
      this.props.deleteProposalSub(id);
    } else {
      this.props.createProposalSub(id);
    }
  }

  render() {
    const { proposal, isFetching, errorMessage, user, followees } = this.props;
    const { filter } = this.state;
    if (isFetching && !proposal) {
      return (
        <p>
          {'Loading...'}{' '}
        </p>
      );
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
      const poll =
        proposal.pollOne.id === this.props.pollId
          ? proposal.pollOne
          : proposal.pollTwo;
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
      if (poll.mode && poll.mode.withStatements) {
        filterNode = (
          <Filter filter={filter} filterFn={this.filterStatements} />
        );
      }
      // return proposal, poll, statementslist
      return (
        <div>
          <Box column pad>
            <CheckBox
              toggle
              checked={proposal.subscribed}
              label={proposal.subscribed ? 'ON' : 'OFF'}
              onChange={this.handleSubscription}
              disabled={isFetching}
            />
            <Proposal {...proposal} />
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
});

const mapDispatch = {
  loadProposal,
  createVote,
  updateVote,
  deleteVote,
  getVotes,
  createProposalSub,
  deleteProposalSub,
};

export default connect(mapStateToProps, mapDispatch)(ProposalContainer);
