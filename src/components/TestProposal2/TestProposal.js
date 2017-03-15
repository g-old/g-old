
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStatement, updateStatement } from '../../actions/statement';
import { createVote, updateVote, deleteVote } from '../../actions/vote';
import Poll from '../Poll';
import Proposal from '../Proposal2';


class TestProposal extends React.Component {

  static propTypes ={
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      votes: PropTypes.number,
      state: PropTypes.string,
      publishedAt: PropTypes.string,
      pollOne: PropTypes.shape({
        statements: PropTypes.arrayOf(PropTypes.object),
        upvotes: PropTypes.number,
        downvotes: PropTypes.number,
        ownVote: PropTypes.shape({
          id: PropTypes.string,
          position: PropTypes.string,
        }),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        })),
      }),
      pollTwo: PropTypes.shape({
        statements: PropTypes.arrayOf(PropTypes.object),
        upvotes: PropTypes.number,
        downvotes: PropTypes.number,
        ownVote: PropTypes.shape({
          id: PropTypes.string,
          position: PropTypes.string,
        }),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        })),
      }),
    }),
    user: PropTypes.object.isRequired,
    hasWrittenStatement: PropTypes.func,
    createStatement: PropTypes.func.isRequired,
    updateStatement: PropTypes.func.isRequired,
    createVote: PropTypes.func.isRequired,
    updateVote: PropTypes.func.isRequired,
    deleteVote: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = { currentPoll: props.proposal.state };
    this.handleVote = this.handleVote.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(data) {
    // TODO check for vote
    console.log(data);


    this.props.createStatement(data);
  }

  handlePollSwitching() {
    // eslint-disable-next-line eqeqeq
    const newPollState = this.state.currentPoll == 'voting' ? 'proposed' : 'voting';
    this.setState({ currentPoll: newPollState });
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
      default: throw Error('Unknown method');

    }
  }
  /* eslint-disable no-nested-ternary */
  render() {
    // decide which poll to display
    let poll = null;
    let switchPoll = false;
    // eslint-disable-next-line eqeqeq
    if (this.state.currentPoll == 'proposed') {
      // eslint-disable-next-line eqeqeq
      switchPoll = this.props.proposal.state != 'proposed';
      poll = (<Poll
        poll={this.props.proposal.pollOne}
        user={this.props.user}
        onVoteButtonClicked={this.handleVote}
        onStatementSubmit={this.handleOnSubmit}

      />);
      // eslint-disable-next-line eqeqeq
    } else if (this.state.currentPoll == 'voting') {
      poll = (<Poll
        poll={this.props.proposal.pollTwo}
        user={this.props.user}
        onVoteButtonClicked={this.handleVote}
        onStatementSubmit={this.handleOnSubmit}
      />);
      switchPoll = true;
    } else {
      poll = 'TO IMPLEMENT';
    }

    // decide if switchBtn should be shown
    let switchPollButton = null;

    if (switchPoll) {
      switchPollButton = <button onClick={() => this.handlePollSwitching()}>OTHER POLL</button>;
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
        {poll}
      </div>
    );
  }

}

const mapDispatch = {
  createStatement,
  updateStatement,
  createVote,
  updateVote,
  deleteVote,
};

export default connect(null, mapDispatch)(TestProposal);
