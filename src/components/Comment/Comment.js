/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
  injectIntl,
} from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import cn from 'classnames';
import s from './Comment.css';
import { ICONS } from '../../constants';
// import Notification from '../Notification';
import { Permissions } from '../../organization';

import Menu from '../Menu';
import Button from '../Button';

const messages = defineMessages({
  flag: {
    id: 'statements.flag',
    defaultMessage: 'flag',
    description: 'Menu entry on statements to flag statement',
  },
  follow: {
    id: 'statements.follow',
    defaultMessage: 'follow',
    description: 'Menu entry on statements to follow author',
  },
  delete: {
    id: 'statements.delete',
    defaultMessage: 'delete',
    description: 'Menu entry on statements to delete statement',
  },
  expand: {
    id: 'statements.expand',
    defaultMessage: 'Read more',
    description: 'Btn to expand statements',
  },
  collapse: {
    id: 'statements.collapse',
    defaultMessage: 'Show less',
    description: 'Btn to collapse statements',
  },
  reply: {
    id: 'commands.reply',
    defaultMessage: 'Reply',
    description: 'Btn to reply',
  },
  expandReplies: {
    id: 'commands.expandReplies',
    defaultMessage: 'View all {cnt} replies',
    description: 'Show replies',
  },
  expandReply: {
    id: 'commands.expandReply',
    defaultMessage: 'View reply',
    description: 'Show reply',
  },
  collapseReplies: {
    id: 'commands.collapseReplies',
    defaultMessage: 'Hide replies',
    description: 'Hide replies',
  },
  edit: {
    id: 'commands.edit',
    defaultMessage: 'Edit',
    description: 'Edit',
  },
  edited: {
    id: 'label.edited',
    defaultMessage: '{time} (edited)',
    description: 'Comment edited',
  },
});

class Comment extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string,
      surname: PropTypes.string,
      thumbnail: PropTypes.string,
      id: PropTypes.string,
    }).isRequired,
    deletedAt: PropTypes.string,
    createdAt: PropTypes.string,
    parentId: PropTypes.string,
    followees: PropTypes.arrayOf(PropTypes.shape({})),
    ownLike: PropTypes.shape({ id: PropTypes.string }),
    user: PropTypes.shape({
      id: PropTypes.string,

      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }),
    preview: PropTypes.bool,
    isFollowee: PropTypes.bool,
    asInput: PropTypes.bool,
    onFlagging: PropTypes.func,
    onModeration: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func,
    onCreate: PropTypes.func,
    onFollow: PropTypes.func,
    onLike: PropTypes.func,
    onDeleteLike: PropTypes.func,
    updates: PropTypes.shape({
      updateCom: PropTypes.shape({ pending: PropTypes.bool }),
      success: PropTypes.bool,
      pending: PropTypes.bool,
    }),
    onProfileClick: PropTypes.func,
    loadReplies: PropTypes.func,
    onReply: PropTypes.func,
    numReplies: PropTypes.number.isRequired,
    openInput: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element),
    own: PropTypes.bool,
    editedAt: PropTypes.string,
    intl: PropTypes.shape({ formatRelative: PropTypes.func }).isRequired,
    showReplies: PropTypes.bool,
    active: PropTypes.bool,
  };

  static defaultProps = {
    ownLike: null,
    asInput: false,
    deletedAt: null,
    onFlagging: null,
    onDelete: null,
    onUpdate: null,
    onCreate: null,
    onFollow: null,
    onModeration: null,
    onLike: null,
    onDeleteLike: null,
    isFollowee: false,
    user: null,
    followees: null,
    updates: null,
    onProfileClick: null,
    loadReplies: null,
    onReply: null,
    openInput: null,
    children: null,
    parentId: null,
    createdAt: null,
    own: null,
    editedAt: null,
    preview: null,
    showReplies: null,
    active: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.content || '' },
      editing: props.asInput === true,
      pending: false,
      collapsed: false,
      open: props.openInput,
      showReplies: props.showReplies,
    };
    this.onDeleteComment = this.onDeleteComment.bind(this);
    this.handleEditing = this.handleEditing.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSubmit = this.onTextSubmit.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.handleFlag = this.handleFlag.bind(this);
    this.handleFollowing = this.handleFollowing.bind(this);
    this.handleLiking = this.handleLiking.bind(this);
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.toggleContent = this.toggleContent.bind(this);
    this.toggleReplies = this.toggleReplies.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
  }

  componentDidMount() {
    if (!this.state.editing) {
      // 3 * 1.3 em lineheight
      if (this.textBox && this.textBox.clientHeight > 3.9 * 16) {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ contentOverflows: true, collapsed: true });
      }
    }
  }

  componentWillReceiveProps({ updates = {}, openInput }) {
    if (updates) {
      if (
        updates.success &&
        (!this.props.updates || !this.props.updates.success)
      ) {
        this.onEndEditing();
      }
      if (updates.pending !== this.state.pending) {
        this.setState({ pending: updates.pending });
      }

      if (updates.errorMessage) {
        this.setState({
          textArea: { val: (updates.comment && updates.comment.content) || '' },
        });
      }
    }
    if (openInput !== this.props.openInput) {
      this.setState({ open: openInput });
    }
  }

  onDeleteComment() {
    const { id, author, user, onDelete, onModeration } = this.props;
    // eslint-disable-next-line eqeqeq
    if (user.id == author.id) {
      onDelete({
        id,
      });
    } else {
      // TODO authorize
      onModeration({
        commentId: id,
        action: 'delete',
      });
    }
  }

  onTextChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }

  onTextSubmit(e) {
    const content = this.state.textArea.val.trim();
    if (content && content !== this.props.content) {
      // TODO validation
      if (this.props.content) {
        // update;
        this.props.onUpdate({ id: this.props.id, content });
      } else {
        this.props.onCreate({
          content,
          ...(this.props.id && {
            parentId: this.props.parentId || this.props.id,
          }),
        });
      }
    }
    // nothing changed
    this.onEndEditing();

    e.preventDefault();
  }

  onEndEditing() {
    const { asInput, content } = this.props;
    this.setState({
      ...this.state,
      textArea: { ...this.state.textArea, val: asInput ? '' : content },
      editing: false,
      open: false,
    });
  }

  handleEditing() {
    this.handleReply();

    this.setState({
      textArea: { val: this.props.content },
      editing: true,
      open: true,
    });
  }

  toggleContent(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.setState({ collapsed: !this.state.collapsed });
  }

  toggleReplies(e) {
    const { showReplies } = this.state;
    e.preventDefault();
    e.stopPropagation();
    if (!showReplies) {
      this.props.loadReplies({ parentId: this.props.id });
    }
    return this.setState({ showReplies: !showReplies });
  }

  handleFlag() {
    const { id, content, onFlagging } = this.props;
    if (onFlagging) {
      onFlagging({
        statementId: id,
        content,
      });
    }
  }

  handleFollowing() {
    const { user, author, onFollow } = this.props;
    onFollow({
      id: user.id,
      followee: author.id,
    });
  }

  handleLiking(e) {
    const { onLike, onDeleteLike, id, ownLike } = this.props;
    if (ownLike) {
      onDeleteLike({
        statementId: id,
        likeId: ownLike.id,
      });
    } else {
      onLike({
        statementId: id,
      });
    }
    e.preventDefault();
  }

  handleProfileClick() {
    const { onProfileClick, author } = this.props;
    if (onProfileClick) {
      onProfileClick({ id: author.id });
    }
  }

  handleReply() {
    this.props.onReply({ id: this.props.id });
    this.setState({ editing: false });
  }

  renderMenu(asInput) {
    let menu;
    const hasMinimumInput = this.state.textArea.val.length >= 5;

    if (asInput || this.state.editing) {
      menu = (
        <span>
          <Button
            plain
            onClick={this.onTextSubmit}
            disabled={!hasMinimumInput}
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <polyline
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  points={ICONS.check}
                />
              </svg>
            }
          />
          <Button
            plain
            onClick={this.onEndEditing}
            disabled={this.props.asInput && !hasMinimumInput}
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS.delete}
                />
              </svg>
            }
          />
        </span>
      );
    } else {
      const { own, deletedAt, user } = this.props;
      let canDelete;
      let canFlag;

      /* eslint-disable no-bitwise */
      if (user) {
        // canLike = !asInput && !own && (user.permissions & Permissions.LIKE) > 0;
        canDelete =
          (own && this.props.onReply) ||
          (!deletedAt && (user.permissions & Permissions.DELETE_COMMENTS) > 0);
        canFlag =
          !own &&
          !deletedAt &&
          (user.permissions & Permissions.FLAG_STATEMENTS) > 0;
      }
      /* eslint-enable no-bitwise */
      const menuFields = [];
      if (canFlag) {
        menuFields.push(
          <Button
            onClick={this.handleFlag}
            plain
            label={<FormattedMessage {...messages.flag} />}
          />,
        );
      }
      if (canDelete) {
        menuFields.push(
          <Button
            onClick={this.onDeleteComment}
            plain
            label={<FormattedMessage {...messages.delete} />}
          />,
        );
      }

      if (own && this.props.onReply) {
        menuFields.push(
          <Button
            onClick={this.handleEditing}
            plain
            label={<FormattedMessage {...messages.edit} />}
          />,
        );
      }
      if (menuFields.length) {
        menu = (
          <Menu
            dropAlign={{ top: 'top', right: 'right' }}
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d="M3,13 L3,11 L5,11 L5,13 L3,13 Z M11,12.9995001 L11,11 L12.9995001,11 L12.9995001,12.9995001 L11,12.9995001 Z M19,12.9995001 L19,11 L20.9995001,11 L20.9995001,12.9995001 L19,12.9995001 Z"
                />
              </svg>
            }
          >
            {menuFields}
          </Menu>
        );
      }
    }
    return menu;
  }

  renderHeader(actor, asInput) {
    const menu = this.props.preview ? null : this.renderMenu(asInput);

    return (
      <div className={s.header}>
        {/* eslint-disable jsx-a11y/interactive-supports-focus */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
        <img // eslint-disable-line
          onClick={this.props.own ? null : this.handleProfileClick}
          className={cn(s.avatar, this.props.own ? null : s.clickable)}
          src={actor && actor.thumbnail}
          alt="IMG"
        />

        {/* eslint-enable jsx-a11y/interactive-supports-focus */}
        <div className={s.details}>
          <div className={s.bar}>
            <span className={s.author}>{`${actor.name} ${actor.surname}`}</span>
            {menu}
          </div>
          {this.props.createdAt && (
            <div className={s.date}>
              {this.props.editedAt ? (
                <FormattedMessage
                  {...messages.edited}
                  values={{
                    time: this.props.intl.formatRelative(this.props.editedAt),
                  }}
                />
              ) : (
                <FormattedRelative value={this.props.createdAt} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  renderFooter(user) {
    const footer = [];
    if (this.props.onReply) {
      footer.push(
        <button onClick={this.handleReply} className={s.command}>
          <FormattedMessage {...messages.reply} />
        </button>,
      );
    }
    if (this.state.open && !this.state.editing) {
      footer.push(
        <div style={{ marginLeft: '3rem' }}>
          <Comment
            id={this.props.id}
            parentId={this.props.parentId}
            onCreate={this.props.onCreate}
            user={user}
            asInput
            updates={this.props.updates || {}}
          />
        </div>,
      );
    }

    if (this.props.numReplies) {
      const expandLabel =
        this.props.numReplies === 1 ? 'expandReply' : 'expandReplies';
      const pending =
        !this.props.children &&
        this.props.updates &&
        this.props.updates.pending;
      footer.push(
        <button
          disabled={this.props.updates && this.props.updates.pending}
          onClick={this.toggleReplies}
          className={cn(s.more, s.command)}
        >
          <FormattedMessage
            {...messages[
              this.state.showReplies && this.props.children
                ? 'collapseReplies'
                : expandLabel
            ]}
            values={{ cnt: this.props.numReplies }}
          />
          {pending ? (
            <svg
              className={s.spinning}
              viewBox="0 0 48 48"
              version="1.1"
              role="img"
              aria-label="Spinning"
            >
              <circle
                cx="24"
                cy="24"
                r="12"
                stroke="#167ac6"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          ) : (
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="form-down"
            >
              <polyline
                fill="none"
                stroke="#000"
                strokeWidth="2"
                points="18 9 12 15 6 9"
                transform={
                  this.state.showReplies ? 'matrix(1 0 0 -1 0 24)' : ''
                }
              />
            </svg>
          )}
        </button>,
      );
    }
    if (this.state.showReplies) {
      footer.push(<div className={s.replies}>{this.props.children} </div>);
    }
    return footer;
  }

  render() {
    //  const { mutationIsPending, mutationSuccess, mutationError } = this.props;
    // TODO create authorization decorator
    const {
      content,
      //      likes,
      author,
      asInput,
      user,

      //  updates,
    } = this.props;
    //  let canLik

    let header;
    const body = [];
    let footer;
    if (asInput) {
      header = this.renderHeader(user, asInput);
      body.push(
        <Textarea
          useCacheForDOMMeasurements
          placeholder="Add a comment"
          value={this.state.textArea.val}
          onChange={this.onTextChange}
          className={s.textEdit}
          minRows={2}
          disabled={this.state.pending}
        />,
      );
    } else {
      header = this.renderHeader(author, asInput);
      if (!this.state.editing) {
        body.push(
          <div className={this.state.collapsed ? s.collapsed : s.expanded}>
            {content}
          </div>,
        );
        if (this.state.contentOverflows) {
          body.push(
            <button onClick={this.toggleContent} className={s.contentToggle}>
              <FormattedMessage
                {...messages[this.state.collapsed ? 'expand' : 'collapse']}
              />
            </button>,
          );
        }
      } else if (this.state.open) {
        body.push(
          <Textarea
            useCacheForDOMMeasurements
            value={this.state.textArea.val}
            onChange={this.onTextChange}
            className={s.textEdit}
            minRows={2}
            disabled={this.state.pending}
          />,
        );
      }
      footer = this.props.preview ? null : this.renderFooter(user);
    }
    return (
      <div className={cn(s.root, this.props.active ? s.active : null)}>
        {header}
        {/* eslint-disable no-return-assign */}
        <div className={s.text} ref={ref => (this.textBox = ref)}>
          {body}
        </div>
        {footer}
      </div>
    );
  }
}

export default withStyles(s)(injectIntl(Comment));
