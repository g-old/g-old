/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import cn from 'classnames';
import s from './Statement.css';
import Notification from '../Notification';
import { Permissions } from '../../organization';
import EditMenu from './EditMenu';
import Avatar from '../Avatar';
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
});

class Statement extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    vote: PropTypes.shape({
      positions: PropTypes.arrayOf(PropTypes.shape({})),
      id: PropTypes.string.isRequired,
    }).isRequired,
    pollId: PropTypes.string.isRequired,
    pollClosed: PropTypes.bool,
    text: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string,
      surname: PropTypes.string,
      thumbnail: PropTypes.string,
      id: PropTypes.string,
    }).isRequired,
    deletedAt: PropTypes.string,

    followees: PropTypes.arrayOf(PropTypes.shape({})),
    ownLike: PropTypes.shape({ id: PropTypes.string }),
    ownStatement: PropTypes.bool,
    user: PropTypes.shape({
      id: PropTypes.string,

      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }),
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
      updateStmt: PropTypes.shape({ pending: PropTypes.bool }),
    }),
    onProfileClick: PropTypes.func,
  };

  static defaultProps = {
    ownLike: null,
    ownStatement: false,
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
    pollClosed: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: props.text || '' },
      edit: props.asInput === true,
      pending: false,
      collapsed: false,
    };
    this.onDeleteStatement = this.onDeleteStatement.bind(this);
    this.onEditStatement = this.onEditStatement.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSubmit = this.onTextSubmit.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.handleFlag = this.handleFlag.bind(this);
    this.handleFollowing = this.handleFollowing.bind(this);
    this.handleLiking = this.handleLiking.bind(this);
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.toggleFullText = this.toggleFullText.bind(this);
  }

  componentDidMount() {
    const { edit } = this.state;
    if (!edit) {
      // 3 * 1.3 em lineheight
      if (this.textBox && this.textBox.clientHeight > 5 * 16) {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ contentOverflows: true, collapsed: true });
      }
    }
  }

  componentWillReceiveProps({ updates }) {
    if (updates) {
      const { pending } = this.state;
      if (updates.success) {
        this.onEndEditing();
      }
      if (updates.pending !== pending) {
        this.setState({ pending: updates.pending });
      }

      if (updates.errorMessage) {
        this.setState({ textArea: { val: updates.statement.text || '' } });
      }
    }
  }

  onDeleteStatement() {
    const { id, author, pollId, user, onDelete, onModeration } = this.props;
    // eslint-disable-next-line eqeqeq
    if (user.id == author.id) {
      onDelete({
        pollId,
        id,
      });
    } else {
      // TODO authorize
      onModeration({
        statementId: id,
        action: 'delete',
      });
    }
  }

  onEditStatement() {
    const { text } = this.props;
    this.setState({ textArea: { val: text }, edit: true });
  }

  onTextChange(e) {
    this.setState({ textArea: { val: e.target.value } });
  }

  onTextSubmit(e) {
    const { pollId, vote, text, onUpdate, id, onCreate } = this.props;
    const { textArea } = this.state;
    const textContent = textArea.val.trim();
    if (textContent && textContent !== text) {
      // TODO validation
      if (text) {
        // update;
        onUpdate({ id, text: textContent });
      } else {
        onCreate({ pollId, text: textContent, voteId: vote.id });
      }
    } else {
      // nothing changed
      this.onEndEditing();
    }

    e.preventDefault();
  }

  onEndEditing() {
    const { asInput, text } = this.props;
    this.setState(prevState => ({
      textArea: { ...prevState.textArea, val: asInput ? '' : text },
      edit: asInput === true,
    }));
  }

  handleFlag() {
    const { id, text, onFlagging } = this.props;
    onFlagging({
      statementId: id,
      content: text,
    });
  }

  handleFollowing() {
    const { user, author, pollId, vote, onFollow } = this.props;
    onFollow({
      id: user.id,
      followee: author.id,
      info: {
        pollId,
        voteId: vote.id,
      },
    });
  }

  handleLiking(e) {
    const { onLike, onDeleteLike, id, pollId, ownLike } = this.props;
    if (ownLike) {
      onDeleteLike({
        statementId: id,
        likeId: ownLike.id,
        pollId,
      });
    } else {
      onLike({
        statementId: id,
        pollId,
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

  toggleFullText(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState(prevState => ({ collapsed: !prevState.collapsed }));
  }

  render() {
    //  const { mutationIsPending, mutationSuccess, mutationError } = this.props;
    // TODO create authorization decorator
    const {
      ownStatement,
      vote,
      text,
      likes,
      author,
      asInput,
      user,
      followees,
      isFollowee,
      deletedAt,
      updates,
      pollClosed,
      ownLike,
      neutral,
      createdAt,
      intl,
    } = this.props;
    const { textArea, edit, pending, collapsed, contentOverflows } = this.state;
    let canLike;
    let canDelete;
    let canFollow;
    let canFlag;

    /* eslint-disable no-bitwise */
    if (user) {
      canLike =
        !asInput && !ownStatement && (user.permissions & Permissions.LIKE) > 0;
      canDelete =
        !deletedAt && (user.permissions & Permissions.DELETE_STATEMENTS) > 0;
      canFlag =
        !ownStatement &&
        !deletedAt &&
        (user.permissions & Permissions.FLAG_STATEMENTS) > 0;
      if (followees) {
        canFollow = !isFollowee && followees.length < 5;
      }
    }
    /* eslint-enable no-bitwise */

    const isEmpty = textArea.val.length === 0;
    const hasMinimumInput = textArea.val.length >= 5;
    const inactive = asInput && isEmpty;

    if (updates && updates.errorMessage) {
      return (
        <Notification
          type="error"
          message={updates.errorMessage}
          action={
            <Button
              primary
              label="Resend"
              onClick={
                updates.statement.delete
                  ? this.onDeleteStatement
                  : this.onTextSubmit
              }
            />
          }
        />
      );
    }

    const textBox = [];
    if (edit) {
      textBox.push(
        <Textarea
          key="0"
          useCacheForDOMMeasurements
          placeholder="Leave a statement (optional)"
          value={textArea.val}
          onChange={this.onTextChange}
          className={s.textEdit}
          minRows={2}
          disabled={pending}
        />,
      );
    } else {
      textBox.push(
        <div key="1" className={collapsed ? s.collapsed : s.expanded}>
          {text}
        </div>,
      );

      if (contentOverflows) {
        textBox.push(
          <button
            type="button"
            key="2"
            onClick={this.toggleFullText}
            className={s.contentToggle}
          >
            <FormattedMessage
              {...messages[collapsed ? 'expand' : 'collapse']}
            />
          </button>,
        );
      }
    }

    let statementPosition;
    if (!neutral) {
      statementPosition =
        vote && vote.positions[0].pos === 0 && vote.positions[0].value
          ? s.pro
          : s.contra;
    }
    let altMenu;
    if (ownStatement || asInput) {
      altMenu = (
        <div className={s.menu}>
          <EditMenu
            isInput={ownStatement || asInput}
            onTextSubmit={this.onTextSubmit}
            onEndEditing={this.onEndEditing}
            onEdit={this.onEditStatement}
            onDelete={this.onDeleteStatement}
            isEditing={edit}
            disabled={deletedAt || pollClosed}
            enableSubmit={hasMinimumInput}
          />
        </div>
      );
    } else {
      altMenu = (
        <div className={s.menu}>
          {canFollow && (
            <button type="button" onClick={this.handleFollowing}>
              <FormattedMessage {...messages.follow} />
            </button>
          )}
          {canFlag && (
            <button type="button" onClick={this.handleFlag}>
              <FormattedMessage {...messages.flag} />
            </button>
          )}
          {canDelete && (
            <button type="button" onClick={this.onDeleteStatement}>
              <FormattedMessage {...messages.delete} />
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={cn(s.rootAlt, statementPosition, inactive && s.inactive)}>
        {/* eslint-disable jsx-a11y/interactive-supports-focus */}
        {!inactive && (
          <div
            className={
              s.avatarSlot // eslint-disable-next-line
            }
          >
            <Avatar
              className={s.avatar}
              user={author}
              onClick={this.handleProfileClick}
            />
            <button
              type="button"
              onClick={canLike && this.handleLiking}
              className={cn(
                s.likes,
                ownLike && s.liked,
                canLike && s.clickable,
              )}
            >
              {`+${likes}`}
            </button>
          </div>
        )}
        {/* eslint-enable jsx-a11y/interactive-supports-focus */}
        <div style={{ width: '100%' }}>
          {!inactive && (
            <div className={s.header}>
              <div className={s.details}>
                <span className={s.author}>
                  {author && author.name} {author && author.surname}
                </span>
                <span className={s.date}>
                  {createdAt && intl.formatRelative(createdAt)}
                </span>
              </div>
            </div>
          )}
          {/* eslint-disable no-return-assign */}
          <div className={s.text} ref={ref => (this.textBox = ref)}>
            {textBox}
            {!inactive && altMenu}
          </div>
          {/* eslint-enable no-return-assign */}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(injectIntl(Statement));
