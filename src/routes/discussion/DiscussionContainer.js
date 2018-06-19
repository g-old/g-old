import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import WorkteamHeader from '../../components/WorkteamHeader';
import s from './DiscussionContainer.css';
// import { defineMessages, FormattedMessage } from 'react-intl';
// import history from '../../history';
import { loadDiscussion, updateDiscussion } from '../../actions/discussion';
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
  getSubscriptionUpdates,
} from '../../reducers';
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../../actions/subscription';
import FetchError from '../../components/FetchError';
import Discussion from '../../components/Discussion';
import Box from '../../components/Box';
import Button from '../../components/Button';
import { ICONS } from '../../constants';
// import Filter from '../../components/Filter';
// import CheckBox from '../../components/CheckBox';
import Comment from '../../components/Comment';
import history from '../../history';
import SubscriptionButton from '../../components/SubscriptionButton';
import { Groups } from '../../organization';

const handleProfileClick = ({ id }) => {
  if (id) history.push(`/accounts/${id}`);
};
class DiscussionContainer extends React.Component {
  static propTypes = {
    discussion: PropTypes.shape({
      comments: PropTypes.arrayOf(PropTypes.shape({})),
      id: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
      subscription: PropTypes.shape({}),
      closedAt: PropTypes.string,
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
    childId: PropTypes.string,
    commentId: PropTypes.string.isRequired,
    createSubscription: PropTypes.func.isRequired,
    updateSubscription: PropTypes.func.isRequired,
    deleteSubscription: PropTypes.func.isRequired,
    updateDiscussion: PropTypes.func.isRequired,

    subscriptionStatus: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    errorMessage: null,
    childId: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.scrollToId = props.childId || props.commentId;
    //  this.handleSubscription = this.handleSubscription.bind(this);
    this.handleCommentCreation = this.handleCommentCreation.bind(this);
    this.handleCommentFetching = this.handleCommentFetching.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleSubscription = this.handleSubscription.bind(this);
    this.handleDiscussionClosing = this.handleDiscussionClosing.bind(this);
  }

  componentDidMount() {
    if (this.commentTo) {
      // TODO let comment handle scrollto and focus
      // eslint-disable-next-line
      const node = findDOMNode(this.commentTo);
      if (node) {
        setTimeout(
          () =>
            // or use window.scrollTo(0, node.offsetTop);
            node.scrollIntoView({ block: 'center', behavior: 'smooth' }),
          100,
        );
      }
    }
  }

  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.discussion;
  }

  handleCommentCreation(data) {
    let targetId;
    if (!this.props.discussion.subscription) {
      targetId = this.props.discussion.id;
    }
    this.props.createComment({
      ...data,
      discussionId: this.props.id,
      targetId,
    });
  }

  handleCommentFetching({ parentId }) {
    this.props.loadComments({ parentId });
  }
  handleDiscussionClosing() {
    const { discussion } = this.props;
    this.props.updateDiscussion({
      id: discussion.id,
      close: !discussion.closedAt,
    });
  }

  handleReply({ id }) {
    if (!this.props.discussion.closedAt) {
      this.setState({ replying: id || '0000' }); // for main input
    }
  }
  handleSubscription({ targetType, subscriptionType }) {
    const { id, subscription } = this.props.discussion;
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
      discussion,
      isFetching,
      errorMessage,
      user,
      commentId,
      childId,
      subscriptionStatus,
    } = this.props;
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
      let closingElement;
      if (
        discussion.workTeam.coordinatorId == user.id || // eslint-disable-line
        user.groups & Groups.ADMIN // eslint-disable-line
      ) {
        closingElement = (
          <Button
            plain
            onClick={this.handleDiscussionClosing}
            icon={
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="lock"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS[discussion.closedAt ? 'unlock' : 'lock']}
                />
              </svg>
            }
          />
        );
      }
      // return proposal, poll, statementslist
      if (!discussion.comments) return <span>NOTHING TO SEE</span>;
      return (
        <div>
          <Box tag="article" column pad align>
            <div
              style={{
                display: 'flex',
                width: '100%',
                flexDirection: 'column',
              }}
            >
              <Box between>
                <WorkteamHeader
                  displayName={discussion.workTeam.displayName}
                  id={discussion.workTeam.id}
                  logo={discussion.workTeam.logo}
                />

                {closingElement}
              </Box>
              <Discussion
                title={discussion.title}
                content={discussion.content}
                createdAt={discussion.createdAt}
                closedAt={discussion.closedAt}
                spokesman={discussion.spokesman}
              />
              {!discussion.closedAt && (
                <SubscriptionButton
                  onSubscribe={this.handleSubscription}
                  subscription={discussion.subscription}
                  targetType="DISCUSSION"
                  status={subscriptionStatus}
                />
              )}
            </div>
            <Box tag="section" column pad fill className={s.commentsSection}>
              {!discussion.closedAt && (
                <Comment
                  asInput
                  user={user}
                  onCreate={this.handleCommentCreation}
                  updates={this.props.updates['0000'] || {}}
                />
              )}

              {discussion.comments &&
                discussion.comments.map(c => (
                  <Comment
                    {...c}
                    showReplies={c.id === commentId && childId}
                    onReply={!discussion.closedAt && this.handleReply}
                    loadReplies={this.handleCommentFetching}
                    onCreate={this.handleCommentCreation}
                    onUpdate={this.props.updateComment}
                    onDelete={this.props.deleteComment}
                    onProfileClick={handleProfileClick}
                    openInput={c.id === this.state.replying}
                    // eslint-disable-next-line eqeqeq
                    own={c.author.id == user.id}
                    user={user}
                    updates={this.props.updates[c.id]}
                    ref={
                      c.id === this.scrollToId
                        ? node => (this.commentTo = node) // eslint-disable-line
                        : null
                    }
                    active={c.id === this.scrollToId}
                  >
                    {c.replies &&
                      c.replies.map(r => (
                        <Comment
                          {...r}
                          onReply={!discussion.closedAt && this.handleReply}
                          reply
                          onCreate={this.handleCommentCreation}
                          onUpdate={this.props.updateComment}
                          onDelete={this.props.deleteComment}
                          openInput={r.id === this.state.replying}
                          onProfileClick={handleProfileClick}
                          // eslint-disable-next-line eqeqeq
                          own={r.author.id == user.id}
                          updates={this.props.updates[c.id]}
                          user={user}
                          ref={
                            r.id === this.scrollToId
                              ? node => (this.commentTo = node) // eslint-disable-line
                              : null
                          }
                          active={r.id === this.scrollToId}
                        />
                      ))}
                  </Comment>
                ))}
            </Box>
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
  subscriptionStatus: getSubscriptionUpdates(state),
});

const mapDispatch = {
  loadDiscussion,
  createComment,
  loadComments,
  updateComment,
  deleteComment,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateDiscussion,
};

export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(DiscussionContainer),
);
