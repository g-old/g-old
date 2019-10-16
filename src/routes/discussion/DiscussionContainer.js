import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import withStyles from 'isomorphic-style-loader/withStyles';
import WorkteamHeader from '../../components/WorkteamHeader';
import Notification from '../../components/Notification';
import s from './DiscussionContainer.css';
// import { defineMessages, FormattedMessage } from 'react-intl';
// import history from '../../history';
import { loadDiscussion, updateDiscussion } from '../../actions/discussion';
import {
  createComment,
  loadComments,
  updateComment,
  deleteComment,
  flagComment,
  scrollToResource,
} from '../../actions/comment';
import {
  // getCommentUpdates,
  getDiscussion,
  getIsDiscussionFetching,
  getDiscussionError,
  getCommentUpdates,
  getSubscriptionUpdates,
  getScrollCount,
} from '../../reducers';
import {
  createCommentVote,
  updateCommentVote,
  deleteCommentVote,
} from '../../actions/commentVote';
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
import { Groups, isVoter } from '../../organization';

const handleProfileClick = ({ id }) => {
  if (id) history.push(`/accounts/${id}`);
};

class DiscussionContainer extends React.Component {
  static propTypes = {
    discussion: PropTypes.shape({
      content: PropTypes.string,
      title: PropTypes.string,
      updatedAt: PropTypes.string,
      createdAt: PropTypes.string,
      comments: PropTypes.arrayOf(PropTypes.shape({})),
      id: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
      subscription: PropTypes.shape({ id: PropTypes.string }),
      closedAt: PropTypes.string,
      deletedAt: PropTypes.string,
      workTeam: PropTypes.shape({
        logo: PropTypes.string,
        id: PropTypes.string,
        coordinatorId: PropTypes.string,
        displayName: PropTypes.string,
      }),
      author: PropTypes.shape({}),
    }).isRequired,
    user: PropTypes.shape({ id: PropTypes.string, groups: PropTypes.number })
      .isRequired,
    isFetching: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    followees: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    loadDiscussion: PropTypes.func.isRequired,
    createComment: PropTypes.func.isRequired,
    loadComments: PropTypes.func.isRequired,
    updateComment: PropTypes.func.isRequired,
    deleteComment: PropTypes.func.isRequired,
    createVote: PropTypes.func.isRequired,
    updateVote: PropTypes.func.isRequired,
    deleteVote: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    updates: PropTypes.shape({ '0000': PropTypes.shape({}) }).isRequired,
    childId: PropTypes.string,
    commentId: PropTypes.string.isRequired,
    createSubscription: PropTypes.func.isRequired,
    updateSubscription: PropTypes.func.isRequired,
    deleteSubscription: PropTypes.func.isRequired,
    updateDiscussion: PropTypes.func.isRequired,
    flagComment: PropTypes.func.isRequired,
    scrollToResource: PropTypes.func.isRequired,
    subscriptionStatus: PropTypes.shape({}).isRequired,
    scrollCounter: PropTypes.shape({
      childId: PropTypes.string,
      id: PropTypes.string,
      containerId: PropTypes.string,
      type: PropTypes.string,
    }),
  };

  static defaultProps = {
    errorMessage: null,
    childId: null,
    scrollCounter: null,
  };

  constructor(props) {
    super(props);
    const scrollTargetId =
      (props.scrollCounter.type === 'comment' &&
        props.scrollCounter.containerId === props.id &&
        props.scrollCounter.childId) ||
      props.scrollCounter.id;
    this.state = {
      scrollTargetId,
    };
    this.handleCommentCreation = this.handleCommentCreation.bind(this);
    this.handleCommentFetching = this.handleCommentFetching.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleSubscription = this.handleSubscription.bind(this);
    this.handleDiscussionClosing = this.handleDiscussionClosing.bind(this);
    this.fetchDiscussion = this.fetchDiscussion.bind(this);
    this.scrollToComment = this.scrollToComment.bind(this);
    this.setRef = this.setRef.bind(this);
    this.checkCommentExists = this.checkCommentExists.bind(this);
    this.handleScrollToResource = this.handleScrollToResource.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.handleDiscussionUpdate = this.handleDiscussionUpdate.bind(this);
    this.storageKey = `discussionMutation${props.discussion.id}`;
    this.deleteStoredData = this.deleteStoredData.bind(this);
    this.handleVoting = this.handleVoting.bind(this);
  }

  componentDidMount() {
    this.findComment();
  }

  componentDidUpdate(prevProps) {
    const { scrollCounter } = this.props;
    this.compareScrollCount(prevProps.scrollCounter, scrollCounter);
  }

  componentWillUnmount() {
    const { scrollToResource: scrollTo } = this.props;
    // clear
    scrollTo({ id: null, type: null, childId: null, containerId: null });
  }

  setRef(node) {
    // eslint-disable-next-line
    if (node /* && node.props.id === this.state.scrollTargetId*/) {
      // this.scrollTarget = node;
      this[`comment$${node.props.id}`] = node;
    }
  }

  compareScrollCount(prevScrollCounter, scrollCounter) {
    if (scrollCounter.type === 'comment') {
      if (prevScrollCounter.containerId !== scrollCounter.containerId) {
        // discussion changed
        this.findComment();
      } else if (prevScrollCounter.counter !== scrollCounter.counter) {
        this.findComment();
      }
    }
  }

  findComment() {
    const { scrollCounter } = this.props;
    if (this.checkCommentExists(scrollCounter)) {
      this.setState(
        { scrollTargetId: scrollCounter.childId || scrollCounter.id },
        this.scrollToComment,
      );
    } else {
      // load comment and scroll
      const { lastCommentFetched } = this.state;
      if (lastCommentFetched) {
        if (
          lastCommentFetched.id === scrollCounter.id &&
          lastCommentFetched.childId === scrollCounter.childId
        ) {
          // comment cannot be fetched successfully
          return;
        }
      }
      if (scrollCounter.id) {
        this.setState(
          { lastCommentFetched: scrollCounter },
          this.handleCommentFetching({ parentId: scrollCounter.id }, true),
        );
      }
    }
  }

  checkCommentExists({ id, childId }) {
    const { discussion } = this.props;
    if (discussion && discussion.comments) {
      const comment = discussion.comments.find(c => c.id === id);
      if (comment) {
        if (childId) {
          const reply =
            comment.replies && comment.replies.find(r => r.id === childId);
          if (!reply) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  scrollToComment() {
    // TODO let comment handle scrollto and focus
    const { scrollTargetId } = this.state;
    const target = this[`comment$${scrollTargetId}`];
    let node;
    try {
      // eslint-disable-next-line
      node = findDOMNode(target);
    } catch (e) {
      console.error(e);
    }
    if (node) {
      // hack, otherwise setting to active has no effect on page load
      this.setState({ activeId: scrollTargetId }, () => {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() =>
          // or use window.scrollTo(0, node.offsetTop);
          {
            node.scrollIntoView({
              block: 'center',
              behavior: 'smooth',
            });
            this.timer = undefined;
          }, 100);
      });
    }
  }

  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    const { discussion } = this.props;
    return discussion;
  }

  handleCommentCreation(data) {
    const { discussion, createComment: makeComment, id } = this.props;
    let targetId;
    if (!discussion.subscription) {
      targetId = discussion.id;
    }
    makeComment({ ...data, discussionId: id, targetId });
  }

  handleCommentFetching({ parentId }, scrollTo) {
    const { loadComments: fetchComments } = this.props;
    fetchComments({ parentId }).then(
      scrollTo ? this.handleScrollToResource : () => {},
    );
  }

  handleScrollToResource() {
    const { scrollToResource: scrollTo, scrollCounter } = this.props;
    scrollTo(scrollCounter);
  }

  handleDiscussionClosing() {
    const { discussion, updateDiscussion: mutateDiscussion } = this.props;
    mutateDiscussion({
      id: discussion.id,
      close: !discussion.closedAt,
      workTeamId: discussion.workTeam.id,
    });
  }

  handleDiscussionUpdate(values) {
    const { discussion, updateDiscussion: mutateDiscussion } = this.props;
    const content =
      values.content || localStorage.getItem(`${this.storageKey}content`);

    const title =
      values.title || localStorage.getItem(`${this.storageKey}title`);
    mutateDiscussion({
      id: discussion.id,
      ...(content ? { content } : {}),
      ...(title ? { title } : {}),
      workTeamId: discussion.workTeam.id,
    }).then(() => {
      this.deleteStoredData();
      this.setState({ isEditing: false });
    });
  }

  toggleEditing() {
    const { isEditing } = this.state;
    if (isEditing) {
      this.deleteStoredData();
    }
    this.setState(prevState => ({ isEditing: !prevState.isEditing }));
  }

  deleteStoredData() {
    localStorage.removeItem(`${this.storageKey}content`);
    localStorage.removeItem(`${this.storageKey}title`);
  }

  handleReply({ id }) {
    const { discussion } = this.props;
    if (!discussion.closedAt) {
      this.setState({ replying: id || '0000' }); // for main input
    }
  }

  handleVoting({ commentId, ownVote, position }) {
    const { createVote, updateVote, deleteVote } = this.props;
    if (ownVote) {
      if (ownVote.position === position) {
        deleteVote({ ...ownVote, commentId });
      } else {
        updateVote({ id: ownVote.id, position });
      }
    } else {
      createVote({ commentId, position });
    }
  }

  handleSubscription({ targetType, subscriptionType }) {
    const {
      discussion: { id, subscription },
      updateSubscription: mutateSubscription,
      createSubscription: subscribe,
      deleteSubscription: unsubscribe,
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

  fetchDiscussion() {
    const { loadDiscussion: fetchDiscussion, id } = this.props;
    fetchDiscussion({ id });
  }

  render() {
    const {
      discussion,
      isFetching,
      errorMessage,
      user,
      scrollCounter,
      subscriptionStatus,
      updates,
      updateComment: mutateComment,
      deleteComment: eraseComment,
      flagComment: flag,
    } = this.props;
    const { replying, activeId, isEditing } = this.state;
    if (isFetching && !discussion) {
      return <p>Loading... </p>;
    }
    if (errorMessage && !discussion) {
      return (
        <FetchError message={errorMessage} onRetry={this.fetchDiscussion} />
      );
    }
    if (this.isReady()) {
      let menu;
      /* eslint-disable eqeqeq, no-bitwise */
      if (
        (discussion.workTeam && discussion.workTeam.coordinatorId == user.id) ||
        user.groups & Groups.ADMIN
      ) {
        /* eslint-enable eqeqeq, no-bitwise */

        menu = (
          <Box>
            <Button
              plain
              onClick={this.toggleEditing}
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
                    d={ICONS[isEditing ? 'close' : 'editBig']}
                  />
                </svg>
              }
            />
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
                    d={ICONS[discussion.closedAt ? 'lock' : 'unlock']}
                  />
                </svg>
              }
            />
          </Box>
        );
      }
      // return proposal, poll, statementslist
      // if (!discussion.comments) return <span>NOTHING TO SEE</span>;
      if (discussion.deletedAt)
        return (
          <Notification type="alert" message="Discussion not accessible!" />
        );
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
                {discussion.workTeam && (
                  <WorkteamHeader
                    displayName={discussion.workTeam.displayName}
                    id={discussion.workTeam.id}
                    logo={discussion.workTeam.logo}
                  />
                )}

                {menu}
              </Box>
              <Discussion
                title={discussion.title}
                content={discussion.content}
                createdAt={discussion.createdAt}
                closedAt={discussion.closedAt}
                updatedAt={discussion.updatedAt}
                author={discussion.author}
                onUpdate={this.handleDiscussionUpdate}
                isEditing={isEditing}
                storageKey={this.storageKey}
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
              {!discussion.closedAt && isVoter(user) && (
                <Comment
                  asInput
                  user={user}
                  onCreate={this.handleCommentCreation}
                  updates={updates['0000'] || {}}
                />
              )}
              {discussion.comments &&
                discussion.comments
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(c => (
                    <Comment
                      {...c}
                      showReplies={
                        c.id === scrollCounter.id && scrollCounter.childId
                      }
                      key={c.id}
                      onReply={!discussion.closedAt && this.handleReply}
                      loadReplies={this.handleCommentFetching}
                      onCreate={this.handleCommentCreation}
                      onModeration={flag}
                      onVote={this.handleVoting}
                      onUpdate={mutateComment}
                      onDelete={eraseComment}
                      onProfileClick={handleProfileClick}
                      openInput={c.id === replying}
                      // eslint-disable-next-line eqeqeq
                      own={c.author.id == user.id}
                      user={user}
                      updates={updates[c.id]}
                      ref={this.setRef}
                      active={c.id === activeId}
                    >
                      {c.replies &&
                        c.replies.map(r => (
                          <Comment
                            {...r}
                            key={r.id}
                            onReply={!discussion.closedAt && this.handleReply}
                            reply
                            onModeration={flag}
                            onVote={this.handleVoting}
                            onCreate={this.handleCommentCreation}
                            onUpdate={mutateComment}
                            onDelete={eraseComment}
                            openInput={r.id === replying}
                            onProfileClick={handleProfileClick}
                            // eslint-disable-next-line eqeqeq
                            own={r.author.id == user.id}
                            updates={updates[c.id]}
                            user={user}
                            ref={this.setRef}
                            active={r.id === activeId}
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
  scrollCounter: getScrollCount(state),
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
  scrollToResource,
  flagComment,
  createVote: createCommentVote,
  updateVote: updateCommentVote,
  deleteVote: deleteCommentVote,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(DiscussionContainer));
