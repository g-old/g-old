/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import cn from 'classnames';
import s from './Comment.css';
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
});
const EditMenu = props => <div>{props.children}</div>;
EditMenu.propTypes = {
  children: PropTypes.element,
};
EditMenu.defaultProps = {
  children: null,
};

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
    loadReplies: PropTypes.func,
    onReply: PropTypes.func,
    numReplies: PropTypes.number.isRequired,
    openInput: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.element),
    own: PropTypes.bool,
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
    loadReplies: null,
    onReply: null,
    openInput: null,
    children: null,
    parentId: null,
    createdAt: null,
    own: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.content || '' },
      edit: props.asInput === true,
      pending: false,
      collapsed: false,
    };
    this.onDeleteStatement = this.onDeleteStatement.bind(this);
    this.handleEditing = this.handleEditing.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSubmit = this.onTextSubmit.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.handleFlag = this.handleFlag.bind(this);
    this.handleFollowing = this.handleFollowing.bind(this);
    this.handleLiking = this.handleLiking.bind(this);
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.openTextInput = this.openTextInput.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.toggleContent = this.toggleContent.bind(this);
    this.toggleReplies = this.toggleReplies.bind(this);
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
        this.setState({ textArea: { val: updates.statement.content || '' } });
      }
    }
  }

  onDeleteStatement() {
    const { id, author, user, onDelete, onModeration } = this.props;
    // eslint-disable-next-line eqeqeq
    if (user.id == author.id) {
      onDelete({
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

  onTextChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }

  onTextSubmit(e) {
    const content = this.state.textArea.val.trim();
    if (content && content !== this.props.content) {
      // TODO validation
      /*  if (this.props.content) {
        // update;
        this.props.onUpdate({ id: this.props.id, content });
      } else { */
      this.props.onCreate({
        content,
        ...(!this.props.asInput && {
          parentId: this.props.parentId || this.props.id,
        }),
      });
      //  }
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
      edit: this.props.asInput === true,
    });
  }
  handleEditing() {
    this.handleReply();
    this.setState({ textArea: { val: this.props.content }, edit: true });
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
    onFlagging({
      statementId: id,
      content,
    });
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

  openTextInput() {
    this.setState({ reply: true });
  }

  handleReply() {
    this.props.onReply({ id: this.props.id });
    this.setState({ edit: false });
  }

  render() {
    //  const { mutationIsPending, mutationSuccess, mutationError } = this.props;
    // TODO create authorization decorator
    const {
      own,
      content,
      //      likes,
      author,
      asInput,
      user,
      followees,
      isFollowee,
      deletedAt,
      updates,
    } = this.props;
    //  let canLike;
    let canDelete;
    let canFollow;
    let canFlag;
    let canEdit;

    /* eslint-disable no-bitwise */
    if (user) {
      // canLike = !asInput && !own && (user.permissions & Permissions.LIKE) > 0;
      canDelete =
        own ||
        (!deletedAt && (user.permissions & Permissions.DELETE_STATEMENTS) > 0);
      canEdit = own;
      canFlag =
        !own &&
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

    /* if (asInput) {
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
                  onClick={this.handleEditing}
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
    */

    if (!this.state.edit && (canFlag || canFollow || own)) {
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
          {canEdit && (
            <Button
              onClick={this.handleEditing}
              plain
              label={<FormattedMessage {...messages.edit} />}
            />
          )}
        </Menu>
      );
    } else if (this.state.edit) {
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
    if (this.props.openInput && this.state.edit) {
      textBox.push(
        <Textarea
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
        <div className={this.state.collapsed ? s.collapsed : s.expanded}>
          {content}
        </div>,
      );

      if (this.state.contentOverflows) {
        textBox.push(
          <button onClick={this.toggleContent} className={s.contentToggle}>
            <FormattedMessage
              {...messages[this.state.collapsed ? 'expand' : 'collapse']}
            />
          </button>,
        );
      }
    }

    return (
      <div className={s.rootAlt}>
        <div className={s.header}>
          {/* eslint-disable jsx-a11y/interactive-supports-focus */}
          {!inactive && (
            <div
              role="button"
              className={s.avatar}
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
          <div className={s.details}>
            <div className={s.bar}>
              {!inactive && (
                <span className={s.author}>
                  {`${author.name} ${author.surname}`}{' '}
                </span>
              )}
              {menu}
            </div>
            <div className={s.date}>
              <FormattedRelative value={this.props.createdAt} />
            </div>
          </div>
        </div>
        {/* eslint-disable no-return-assign */}

        <div className={s.text} ref={ref => (this.textBox = ref)}>
          {textBox}
        </div>
        <button onClick={this.handleReply} className={s.command}>
          <FormattedMessage {...messages.reply} />
        </button>
        {/*  <div className={s.text} ref={ref => (this.textBox = ref)}>
            {textBox}
          </div>
          <button onClick={this.handleReply} className={s.command}>
            <FormattedMessage {...messages.reply} />
          </button> */}

        {/* eslint-enable no-return-assign */}
        {this.props.openInput &&
          !this.state.edit && (
            <div>
              <span style={{ marginRight: '0.5em' }}>
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
              </span>
              <Textarea
                useCacheForDOMMeasurements
                placeholder="Leave a statement (optional)"
                value={this.state.textArea.val}
                onChange={this.onTextChange}
                className={s.textEdit}
                minRows={2}
                disabled={this.state.pending}
              />
            </div>
          )}
        {this.state.showReplies && (
          <div className={s.replies}>{this.props.children} </div>
        )}
        {this.props.numReplies !== 0 && (
          <button onClick={this.toggleReplies} className={s.command}>
            <FormattedMessage
              {...messages[
                this.state.showReplies ? 'collapseReplies' : 'expandReplies'
              ]}
              values={{ cnt: this.props.numReplies }}
            />
          </button>
        )}
        {/* {' '}
          {this.props.replies &&
            this.props.replies.map(r => (
              <Comment
                {...r}
                onReply={this.props.onReply}
                reply
                onCreate={this.props.onCreate}
              />
            ))} */}
      </div>
    );
  }
}

export default withStyles(s)(Comment);
