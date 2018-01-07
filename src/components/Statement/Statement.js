/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import cn from 'classnames';
import s from './Statement.css';
import { ICONS } from '../../constants';
import Notification from '../Notification';
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
});
const EditMenu = props => <div>{props.children}</div>;
EditMenu.propTypes = {
  children: PropTypes.element,
};
EditMenu.defaultProps = {
  children: null,
};

class Statement extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    vote: PropTypes.shape({
      position: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
    pollId: PropTypes.string.isRequired,
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
    menuOpen: false,
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
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.text || '' },
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
  }

  componentDidMount() {
    if (!this.state.edit) {
      // 3 * 1.3 em lineheight
      if (this.textBox && this.textBox.clientHeight > 3.9 * 16) {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ contentOverflows: true, collapsed: true });
      }
    }
  }

  componentWillReceiveProps({ updates }) {
    if (updates) {
      if (updates.success) {
        this.onEndEditing();
      }
      if (updates.pending !== this.state.pending) {
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
    this.setState({ textArea: { val: this.props.text }, edit: true });
  }

  onTextChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }

  onTextSubmit(e) {
    const { pollId, vote } = this.props;
    const text = this.state.textArea.val.trim();
    if (text && text !== this.props.text) {
      // TODO validation
      if (this.props.text) {
        // update;
        this.props.onUpdate({ id: this.props.id, text });
      } else {
        this.props.onCreate({ pollId, text, voteId: vote.id });
      }
    } else {
      // nothing changed
      this.onEndEditing();
    }

    e.preventDefault();
  }

  onEndEditing() {
    const { asInput, text } = this.props;
    this.setState({
      ...this.state,
      textArea: { ...this.state.textArea, val: asInput ? '' : text },
      edit: this.props.asInput === true,
    });
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
      onProfileClick,
    } = this.props;
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

    const isEmpty = this.state.textArea.val.length === 0;
    const hasMinimumInput = this.state.textArea.val.length >= 5;
    const inactive = asInput && isEmpty;

    let menu = null;
    if (ownStatement || asInput) {
      menu = (
        <EditMenu>
          {!deletedAt && (
            <span style={{ marginRight: '0.5em' }}>
              {this.state.edit ? (
                <span>
                  <Button
                    plain
                    onClick={this.onTextSubmit}
                    disabled={!hasMinimumInput}
                    icon={
                      <svg
                        viewBox="0 0 24 24"
                        width="24px"
                        height="24px"
                        role="img"
                      >
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
                      <svg
                        viewBox="0 0 24 24"
                        width="24px"
                        height="24px"
                        role="img"
                      >
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
              ) : (
                <Button
                  plain
                  onClick={this.onEditStatement}
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
                        d={ICONS.edit}
                      />
                    </svg>
                  }
                />
              )}
              {!asInput && (
                <Button
                  plain
                  onClick={this.onDeleteStatement}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="24px"
                      height="24px"
                      role="img"
                    >
                      <path
                        fill="none"
                        stroke="#000"
                        strokeWidth="2"
                        d={ICONS.trash}
                      />
                    </svg>
                  }
                />
              )}
            </span>
          )}
        </EditMenu>
      );
    } else if (canFlag || canFollow || canDelete) {
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
          {canFollow && (
            <Button
              onClick={this.handleFollowing}
              plain
              label={<FormattedMessage {...messages.follow} />}
            />
          )}
          {canFlag && (
            <Button
              onClick={this.handleFlag}
              plain
              label={<FormattedMessage {...messages.flag} />}
            />
          )}
          {canDelete && (
            <Button
              onClick={this.onDeleteStatement}
              plain
              label={<FormattedMessage {...messages.delete} />}
            />
          )}
        </Menu>
      );
    }

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
    if (this.state.edit) {
      textBox.push(
        <Textarea
          key="0"
          useCacheForDOMMeasurements
          placeholder="Leave a statement (optional)"
          value={this.state.textArea.val}
          onChange={this.onTextChange}
          className={s.textEdit}
          minRows={2}
          disabled={this.state.pending}
        />,
      );
    } else {
      textBox.push(
        <div
          key="1"
          className={this.state.collapsed ? s.collapsed : s.expanded}
        >
          {text}
        </div>,
      );

      if (this.state.contentOverflows) {
        textBox.push(
          <button
            key="2"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              return this.setState({ collapsed: !this.state.collapsed });
            }}
            className={s.contentToggle}
          >
            <FormattedMessage
              {...messages[this.state.collapsed ? 'expand' : 'collapse']}
            />
          </button>,
        );
      }
    }

    return (
      <div
        className={cn(
          s.rootAlt,
          vote && vote.position === 'pro' ? s.pro : s.contra,
          inactive && s.inactive,
        )}
      >
        {/* eslint-disable jsx-a11y/interactive-supports-focus */}
        {!inactive && (
          <div
            role="button"
            style={{ cursor: onProfileClick ? 'pointer' : 'auto' }}
            onClick={this.handleProfileClick}
          >
            <img
              className={cn(s.avatar)}
              src={author && author.thumbnail}
              alt="IMG"
            />
          </div>
        )}
        {/* eslint-enable jsx-a11y/interactive-supports-focus */}
        <div style={{ width: '100%' }}>
          {!inactive && (
            <div className={s.header}>
              <div>
                <span className={s.author}>
                  {author && author.name} {author && author.surname}
                </span>
                <span>
                  {likes ? ` (+${likes})` : ''}

                  {canLike && (
                    <Button
                      onClick={this.handleLiking}
                      plain
                      icon={
                        <svg viewBox="0 0 24 24" width="16px" height="16px">
                          <path
                            fill="none"
                            stroke={this.props.ownLike ? '#8cc800' : '#666'}
                            strokeWidth="1"
                            d={ICONS.thumbUpAlt}
                          />
                        </svg>
                      }
                    />
                  )}
                </span>
              </div>
              {menu}
            </div>
          )}
          {/* eslint-disable no-return-assign */}
          <div className={s.text} ref={ref => (this.textBox = ref)}>
            {textBox}
          </div>
          {/* eslint-enable no-return-assign */}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Statement);
