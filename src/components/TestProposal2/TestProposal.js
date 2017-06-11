import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStatement, updateStatement, deleteStatement } from '../../actions/statement';
import { createVote, updateVote, deleteVote, getVotes } from '../../actions/vote';
import Poll from '../Poll';
import Proposal from '../Proposal2';
import Icon from '../Icon';
import { ICONS } from '../../constants';
import Button from '../Button';
import { getLastActivePoll } from '../../core/helpers';

const messages = defineMessages({
  otherPoll: {
    id: 'otherPoll',
    defaultMessage: 'Switch poll',
    description: 'Button for switching between polls',
  },
});

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
        closed_at: PropTypes.string,
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
        closed_at: PropTypes.string,
        upvotes: PropTypes.number,
        end_time: PropTypes.string,
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
    this.state = { proposalState: props.proposal.state, filter: 'ids' };
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

  handlePollSwitching(proposalState, proposal) {
    // eslint-disable-next-line eqeqeq
    let newProposalState; // = this.state.proposalState == 'voting' ? 'proposed' : 'voting';
    switch (proposalState) {
      case 'proposed': {
        newProposalState = 'voting';
        break;
      }
      case 'voting': {
        newProposalState = 'proposed';
        break;
      }
      case 'accepted': {
        if (proposal.pollTwo && proposal.pollTwo.closed_at) {
          newProposalState = 'proposed';
        } else {
          newProposalState = proposalState;
        }

        break;
      }
      case 'rejected': {
        newProposalState = 'proposed';
        break;
      }
      case 'revoked': {
        newProposalState = proposalState;
        break;
      }

      default:
        throw Error(`Unknown proposal state: ${proposal.state}`);
    }
    this.setState({ proposalState: newProposalState });
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
    const pollData = {
      user: this.props.user,
      onVoteButtonClicked: this.handleVote,
      onStatementSubmit: this.handleOnSubmit,
      onDeleteStatement: this.onDeleteStatement,
      fetchVotes: this.props.getVotes,
      votingListErrorMessage: this.props.votingListErrorMessage,
      votingListIsFetching: this.props.votingListIsFetching,
      filter: this.state.filter,
    };
    pollData.poll = getLastActivePoll(this.state.proposalState, this.props.proposal);
    const poll = <Poll {...pollData} />;

    let switchPoll = false;
    if (this.props.proposal.state !== 'proposed') {
      if (this.props.proposal.pollTwo && this.props.proposal.pollTwo.end_time) {
        switchPoll = true;
      } else {
        switchPoll = false;
      }
    }
    let switchPollButton = null;

    if (switchPoll) {
      switchPollButton = (
        <Button
          label={<FormattedMessage {...messages.otherPoll} />}
          icon={
            <Icon icon={ICONS.leftArrow} size={24} vBox={24} transform={'matrix(-1 0 0 1 24 0)'} />
          }
          onClick={() => this.handlePollSwitching(this.state.proposalState, this.props.proposal)}
        />
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
        {poll &&
          poll.props &&
          poll.props.poll &&
          poll.props.poll.statements &&
          poll.props.poll.statements.length > 1 &&
          <span>
            <button
              style={this.state.filter === 'ids' ? { backgroundColor: 'cornflowerblue' } : null}
              onClick={() => this.setState({ filter: 'ids' })}
            >
              ALL
            </button>
            <button
              style={this.state.filter === 'con' ? { backgroundColor: 'cornflowerblue' } : null}
              onClick={() => this.setState({ filter: 'con' })}
            >
              CON
            </button>
            <button
              style={this.state.filter === 'pro' ? { backgroundColor: 'cornflowerblue' } : null}
              onClick={() => this.setState({ filter: 'pro' })}
            >
              PRO
            </button>
          </span>}
        {poll}
        {switchPollButton}
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
