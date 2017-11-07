/* eslint-disable */

throw new Error("TO IMPLEMENT");

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { defineMessages, FormattedMessage } from "react-intl";
import history from "../../history";
import { loadDiscussion } from "../../actions/discussion";
import {
  createComment,
  updateComment,
  deleteComment,
} from "../../actions/comment";
import {
  getCommentUpdates,
  getDiscussion,
  getIsDiscussionFetching,
  getDiscussionErrorMessage,
} from "../../reducers";
import FetchError from "../../components/FetchError";
import CommentContainer from "../../components/CommentContainer";
import Discussion from "../../components/Discussion";
import Box from "../../components/Box";
import Button from "../../components/Button";
import Filter from "../../components/Filter";
import CheckBox from "../../components/CheckBox";

const messages = defineMessages({
  voting: {
    id: "voting",
    defaultMessage: "Voting",
    description: "Switch to voting poll",
  },
  proposal: {
    id: "proposal",
    defaultMessage: "Proposal",
    description: "Switch to proposal poll",
  },
});
class DiscussionContainer extends React.Component {
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
    this.state = { filter: "all" };
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
      case "create": {
        this.props.createVote(data);
        break;
      }
      case "update": {
        this.props.updateVote(data, info);
        break;
      }
      case "del": {
        this.props.deleteVote(data, info);
        break;
      }
      default:
        throw Error("Unknown method");
    }
  }

  render() {
    const {
      discussion,
      isFetching,
      errorMessage,
      user,
      followees,
    } = this.props;
    const { filter } = this.state;
    if (isFetching && !discussion) {
      return <p>{"Loading..."} </p>;
    }
    if (errorMessage && !discussion) {
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
                {...messages[isPollOne ? "voting" : "proposal"]}
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
                  transform={isPollOne ? null : "matrix(-1 0 0 1 24 0)"}
                />
              </svg>
            }
            onClick={this.handlePollSwitching}
          />
        );
      }
      let hideOwnStatement = true;
      if (
        filter === "all" ||
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
            <CheckBox
              toggle
              checked={discussion.subscribed}
              label={discussion.subscribed ? "ON" : "OFF"}
              onChange={this.handleSubscription}
              disabled={isFetching}
            />
            <Discussion {...discussion} />

            {filterNode}
            <CommentContainer
              hideOwnStatement={hideOwnStatement}
              user={user}
              filter={this.state.filter}
            />
          </Box>
        </div>
      ); // <TestProposal user={this.props.user} proposal={this.props.proposal} />;
    }
    return <div>STILL LOADING ...</div>;
  }
}
DiscussionContainer.propTypes = {};
// TODO implement memoiziation with reselect

const mapStateToProps = (state, { id }) => ({
  discussion: getDiscussion(state, id),
  isFetching: getIsDiscussionFetching(state, id),
  errorMessage: getDiscussionErrorMessage(state, id),
});

const mapDispatch = {
  loadDiscussion,
  createComment,
  updateComment,
  deleteComment,
};

export default connect(mapStateToProps, mapDispatch)(DiscussionContainer);
