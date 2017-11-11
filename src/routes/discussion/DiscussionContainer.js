import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
// import history from '../../history';
import { loadDiscussion } from '../../actions/discussion';
import {
  createComment,
  loadComments,
  updateComment,
  deleteComment,
} from '../../actions/comment';
import {
  // getCommentUpdates,
  getDiscussion,
  getIsDiscussionFetching,
  getDiscussionError,
  getCommentUpdates,
} from '../../reducers';
import FetchError from '../../components/FetchError';
import Discussion from '../../components/Discussion';
import Box from '../../components/Box';
// import Button from '../../components/Button';
// import Filter from '../../components/Filter';
import CheckBox from '../../components/CheckBox';
import Comment from '../../components/Comment';

class DiscussionContainer extends React.Component {
  static propTypes = {
    discussion: PropTypes.shape({
      comments: PropTypes.arrayOf(PropTypes.shape({})),
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
    loadDiscussion: PropTypes.func.isRequired,
    createComment: PropTypes.func.isRequired,
    loadComments: PropTypes.func.isRequired,
    updateComment: PropTypes.func.isRequired,
    deleteComment: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    updates: PropTypes.shape({ '0000': PropTypes.shape({}) }).isRequired,
  };
  static defaultProps = {
    errorMessage: null,
  };
  constructor(props) {
    super(props);
    this.state = { filter: 'all' };
    //  this.handleSubscription = this.handleSubscription.bind(this);
    this.handleCommentCreation = this.handleCommentCreation.bind(this);
    this.handleCommentFetching = this.handleCommentFetching.bind(this);
    this.handleReply = this.handleReply.bind(this);
  }

  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.discussion;
  }

  filterStatements(e, { filter }) {
    e.preventDefault();
    this.setState({ filter });
  }
  handleCommentCreation(data) {
    this.props.createComment({ ...data, discussionId: this.props.id });
  }

  handleCommentFetching({ parentId }) {
    this.props.loadComments({ parentId });
  }

  handleReply({ id }) {
    this.setState({ replying: id || '0000' }); // for main input
  }

  render() {
    const { discussion, isFetching, errorMessage, user } = this.props;
    if (isFetching && !discussion) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !discussion) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => this.props.loadDiscussion({ id: this.props.id })}
        />
      );
    }
    if (this.isReady()) {
      // return proposal, poll, statementslist
      return (
        <div>
          <Box column pad>
            <CheckBox
              toggle
              checked={discussion.subscribed}
              label={discussion.subscribed ? 'ON' : 'OFF'}
              onChange={this.handleSubscription}
              disabled={isFetching}
            />
            <Discussion {...discussion} />
            {`COMMENTS * ${discussion.numComments}`}
            <Comment
              asInput
              user={user}
              onCreate={this.handleCommentCreation}
              updates={this.props.updates['0000'] || {}}
            />
            {'TOP COMMENTS'}
            {this.props.discussion.comments &&
              this.props.discussion.comments.map(c => (
                <Comment
                  {...c}
                  onReply={this.handleReply}
                  loadReplies={this.handleCommentFetching}
                  onCreate={this.handleCommentCreation}
                  onUpdate={this.props.updateComment}
                  onDelete={this.props.deleteComment}
                  openInput={c.id === this.state.replying}
                  // eslint-disable-next-line eqeqeq
                  own={c.author.id == user.id}
                  user={user}
                  updates={this.props.updates[c.id]}
                >
                  {c.replies &&
                    c.replies.map(r => (
                      <Comment
                        {...r}
                        onReply={this.handleReply}
                        reply
                        onCreate={this.handleCommentCreation}
                        onUpdate={this.props.updateComment}
                        onDelete={this.props.deleteComment}
                        openInput={r.id === this.state.replying}
                        // eslint-disable-next-line eqeqeq
                        own={r.author.id == user.id}
                        updates={this.props.updates[c.id]}
                        user={user}
                      />
                    ))}
                </Comment>
              ))}
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
  errorMessage: getDiscussionError(state, id),
  updates: getCommentUpdates(state),
});

const mapDispatch = {
  loadDiscussion,
  createComment,
  loadComments,
  updateComment,
  deleteComment,
};

export default connect(mapStateToProps, mapDispatch)(DiscussionContainer);
