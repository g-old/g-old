import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStatement, updateStatement, deleteStatement } from '../../actions/statement';
import { createVote, updateVote, deleteVote, getVotes } from '../../actions/vote';
import Poll from '../Poll';
import Proposal from '../Proposal2';
import { thresholdPassed } from '../../core/helpers';
import Icon from '../Icon';

class TestProposal extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      votes: PropTypes.number,
      state: PropTypes.string,
      publishedAt: PropTypes.string,
      pollOne: PropTypes.shape({
        statements: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          }),
        ),
        upvotes: PropTypes.number,
        downvotes: PropTypes.number,
        ownVote: PropTypes.shape({
          id: PropTypes.string,
          position: PropTypes.string,
        }),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            statementId: PropTypes.string,
          }),
        ),
      }),
      pollTwo: PropTypes.shape({
        statements: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          }),
        ),
        upvotes: PropTypes.number,
        downvotes: PropTypes.number,
        ownVote: PropTypes.shape({
          id: PropTypes.string,
          position: PropTypes.string,
        }),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            statementId: PropTypes.string,
          }),
        ),
      }),
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
    createStatement: PropTypes.func.isRequired,
    updateStatement: PropTypes.func.isRequired,
    deleteStatement: PropTypes.func.isRequired,
    getVotes: PropTypes.func.isRequired,
    createVote: PropTypes.func.isRequired,
    updateVote: PropTypes.func.isRequired,
    deleteVote: PropTypes.func.isRequired,
    votingListErrorMessage: PropTypes.string,
    votingListIsFetching: PropTypes.bool.isRequired,
  };
  static defaultProps = {
    votingListErrorMessage: null,
  };
  constructor(props) {
    super(props);
    this.state = { currentPoll: props.proposal.state, filter: 'ids' };
    this.handleVote = this.handleVote.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.onDeleteStatement = this.onDeleteStatement.bind(this);
  }

  onDeleteStatement(data) {
    this.props.deleteStatement(data);
  }
  handleOnSubmit(data) {
    // TODO check for vote
    if (data.id) {
      this.props.updateStatement(data);
    } else {
      this.props.createStatement(data);
    }
  }

  handlePollSwitching() {
    // eslint-disable-next-line eqeqeq
    const newPollState = this.state.currentPoll == 'voting' ? 'proposed' : 'voting';
    this.setState({ currentPoll: newPollState });
  }

  handleFetchVotes(pollId) {
    this.props.getVotes(pollId);
  }

  handleVote(data, method) {
    switch (method) {
      case 'create': {
        this.props.createVote(data);
        break;
      }
      case 'update': {
        this.props.updateVote(data);
        break;
      }
      case 'del': {
        this.props.deleteVote(data);
        break;
      }
      default:
        throw Error('Unknown method');
    }
  }
  /* eslint-disable no-nested-ternary */

  render() {
    // decide which poll to display
    let poll = null;
    let switchPoll = false;
    // eslint-disable-next-line eqeqeq
    if (this.state.currentPoll === 'proposed') {
      // eslint-disable-next-line eqeqeq
      switchPoll = this.props.proposal.state !== 'proposed';
      poll = (
        <Poll
          poll={this.props.proposal.pollOne}
          user={this.props.user}
          onVoteButtonClicked={this.handleVote}
          onStatementSubmit={this.handleOnSubmit}
          onDeleteStatement={this.onDeleteStatement}
          fetchVotes={this.props.getVotes}
          votingListErrorMessage={this.props.votingListErrorMessage}
          votingListIsFetching={this.props.votingListIsFetching}
          filter={this.state.filter}
        />
      );
      // eslint-disable-next-line eqeqeq
    } else if (this.state.currentPoll === 'voting') {
      poll = (
        <Poll
          poll={this.props.proposal.pollTwo}
          user={this.props.user}
          onVoteButtonClicked={this.handleVote}
          onStatementSubmit={this.handleOnSubmit}
          onDeleteStatement={this.onDeleteStatement}
          fetchVotes={this.props.getVotes}
          filter={this.state.filter}
        />
      );
      switchPoll = true;
    } else if (this.state.currentPoll === 'accepted') {
      // how was it accepted? a) time, b) votes

      const passed = thresholdPassed(this.props.proposal.pollOne);
      poll = (
        <Poll
          poll={passed ? this.props.proposal.pollTwo : this.props.proposal.pollOne}
          user={this.props.user}
          onVoteButtonClicked={this.handleVote}
          onStatementSubmit={this.handleOnSubmit}
          onDeleteStatement={this.onDeleteStatement}
          fetchVotes={this.props.getVotes}
          filter={this.state.filter}
        />
      );
    } else if (this.state.currentPoll === 'rejected') {
      const passed = thresholdPassed(this.props.proposal.pollOne);
      poll = (
        <Poll
          poll={passed ? this.props.proposal.pollTwo : this.props.proposal.pollOne}
          user={this.props.user}
          onVoteButtonClicked={this.handleVote}
          onStatementSubmit={this.handleOnSubmit}
          onDeleteStatement={this.onDeleteStatement}
          fetchVotes={this.props.getVotes}
          filter={this.state.filter}
        />
      );
    } else {
      poll = 'TO IMPLEMENT';
    }

    // decide if switchBtn should be shown
    let switchPollButton = null;

    if (switchPoll) {
      switchPollButton = (
        <button onClick={() => this.handlePollSwitching()}>
          OTHER POLL
          {' '}
          <Icon
            icon={
              'M12.586 27.414l-10-10c-0.781-0.781-0.781-2.047 0-2.828l10-10c0.781-0.781 2.047-0.781 2.828 0s0.781 2.047 0 2.828l-6.586 6.586h19.172c1.105 0 2 0.895 2 2s-0.895 2-2 2h-19.172l6.586 6.586c0.39 0.39 0.586 0.902 0.586 1.414s-0.195 1.024-0.586 1.414c-0.781 0.781-2.047 0.781-2.828 0z'
            }
          />
        </button>
      );
    }

    const proposalData = {
      title: this.props.proposal.title,
      body: this.props.proposal.body,
      id: this.props.proposal.id,
      publishedAt: this.props.proposal.publishedAt,
      state: this.props.proposal.state,
    };

    return (
      <div>
        <Proposal proposal={proposalData} />
        {switchPollButton}
        <button onClick={() => this.setState({ filter: 'ids' })}>ALL</button>
        <button onClick={() => this.setState({ filter: 'con' })}>CON</button>
        <button onClick={() => this.setState({ filter: 'pro' })}>PRO</button>
        {poll}
      </div>
    );
  }
}

const mapDispatch = {
  createStatement,
  updateStatement,
  deleteStatement,
  getVotes,
  createVote,
  updateVote,
  deleteVote,
};

export default connect(null, mapDispatch)(TestProposal);
