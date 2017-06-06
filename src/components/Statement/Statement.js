/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import cn from 'classnames';
import s from './Statement.css';
import { createLike, deleteLike } from '../../actions/statement_like';
import { updateUser } from '../../actions/user';
import { deleteStatement, flag, solveFlag } from '../../actions/statement';
import Icon from '../Icon';
import { ICONS } from '../../constants';
import {
  getStatementMutationIsPending,
  getStatementMutationSuccess,
  getStatementMutationError,
  getSessionUser,
  getFollowees,
} from '../../reducers';

import Menu from '../Menu';
import Button from '../Button';

const EditMenu = props => <div>{props.children}</div>;
EditMenu.propTypes = {
  children: PropTypes.element,
};
EditMenu.defaultProps = {
  children: null,
};

class Statement extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    data: PropTypes.shape({
      id: PropTypes.string,
      vote: PropTypes.shape({
        position: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
      }),
      pollId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      author: PropTypes.shape({
        name: PropTypes.string,
        surname: PropTypes.string,
        avatar: PropTypes.string,
        id: PropTypes.string,
      }),
      deletedAt: PropTypes.string,
    }).isRequired,
    followees: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    flag: PropTypes.func.isRequired,
    ownLike: PropTypes.shape({ id: PropTypes.string }),
    ownStatement: PropTypes.bool,
    deleteStatement: PropTypes.func.isRequired,
    solveFlag: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,

      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }).isRequired,
    asInput: PropTypes.bool,
  };

  static defaultProps = {
    ownLike: null,
    ownStatement: false,
    asInput: false,
    menuOpen: false,
    onSubmit() {
      alert('NO ONSUBMIT');
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.data.text || '' },
      edit: props.asInput === true,
    };
    this.onDeleteStatement = this.onDeleteStatement.bind(this);
    this.onEditStatement = this.onEditStatement.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSubmit = this.onTextSubmit.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.handleFlag = this.handleFlag.bind(this);
    this.handleFollowing = this.handleFollowing.bind(this);
  }

  onDeleteStatement() {
    if (this.props.user.id === this.props.data.author.id) {
      this.props.deleteStatement({
        pollId: this.props.data.pollId,
        id: this.props.data.id,
      });
    } else {
      // TODO authorize
      this.props.solveFlag({
        statementId: this.props.data.id,
        action: 'delete',
      });
    }
  }

  onEditStatement() {
    this.setState({ ...this.state, edit: true });
  }

  onTextChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }

  onTextSubmit(e) {
    const text = this.state.textArea.val.trim();
    if (text) {
      // TODO validation
      this.props.onSubmit({ id: this.props.data.id, text }, this.props.data.text != null);
    }

    this.onEndEditing();
    e.preventDefault();
  }

  onEndEditing() {
    //
    this.setState({
      ...this.state,
      textArea: { ...this.state.textArea, val: this.props.asInput ? '' : this.props.data.text },
      edit: this.props.asInput === true,
    });
  }
  handleFlag() {
    const { id, text } = this.props.data;
    this.props.flag({
      statementId: id,
      content: text,
    });
  }

  handleFollowing() {
    const { user, data } = this.props;
    this.props.updateUser({
      id: user.id,
      followee: data.author.id,
      info: {
        pollId: data.pollId,
        voteId: data.vote.id,
      },
    });
  }

  handleLikeClick(e, like) {
    if (!like) {
      this.props.createLike({
        statementId: this.props.data.id,
        pollId: this.props.data.pollId,
      });
    } else {
      this.props.deleteLike({
        statementId: this.props.data.id,
        likeId: like.id,
        pollId: this.props.data.pollId,
      });
    }
    e.preventDefault();
  }

  render() {
    //  const { mutationIsPending, mutationSuccess, mutationError } = this.props;
    // TODO create authorization decorator
    const { ownStatement, data, asInput, user, followees } = this.props;
    if (!user) return null;

    const isEmpty = this.state.textArea.val.length === 0;
    const hasMinimumInput = this.state.textArea.val.length >= 5;
    const inactive = asInput && isEmpty;
    const canLike = user.role.type !== 'guest' && !asInput && !ownStatement;
    const canFollow = followees.length < 5
      ? followees.find(f => f.id === data.author.id) == null
      : false;

    const canFlag = !ownStatement && !data.deletedAt;
    const canDelete = !data.deletedAt && ['admin', 'mod'].includes(user.role.type);

    let menu = null;
    if (ownStatement || asInput) {
      menu = (
        <EditMenu>
          {!data.deletedAt &&
            <span style={{ marginRight: '0.5em' }}>
              {this.state.edit
                ? <span>
                  <button onClick={this.onTextSubmit} disabled={!hasMinimumInput}>
                    <i className="fa fa-check" />
                  </button>
                  <button
                    onClick={this.onEndEditing}
                    disabled={this.props.asInput && !hasMinimumInput}
                  >
                    <i className="fa fa-times" />
                  </button>
                </span>
                : <button onClick={this.onEditStatement}>
                  <i className="fa fa-pencil" />
                </button>}
              {!asInput &&
                <button onClick={this.onDeleteStatement}>
                  <i className="fa fa-trash" />
                </button>}
            </span>}
        </EditMenu>
      );
    } else {
      menu = (
        <Menu
          dropAlign={{ top: 'top', left: 'left' }}
          icon={<Icon icon={ICONS.menu} size={20} color="grey" />}
        >
          {canFollow && <Button onClick={this.handleFollowing} plain label="Followme" />}
          {canFlag && <Button onClick={this.handleFlag} plain label="Flag" />}
          {canDelete && <Button onClick={this.onDeleteStatement} plain label="Delete" />}
        </Menu>
      );
    }
    return (
      <div
        className={cn(
          s.rootAlt,
          this.props.data.vote.position === 'pro' ? s.pro : s.contra,
          inactive && s.inactive,
        )}
      >
        {!inactive &&
          <img className={cn(s.avatar)} src={this.props.data.author.avatar} alt="IMG" />}
        <div style={{ width: '100%' }}>
          {!inactive &&
            <div className={s.header}>
              <div>
                <span className={s.author}>
                  {this.props.data.author.name} {this.props.data.author.surname}
                </span>
                <span>
                  {this.props.data.likes ? ` (+${this.props.data.likes})` : ''}
                  {canLike &&
                    <button
                      onClick={e => this.handleLikeClick(e, this.props.ownLike)}
                      className={cn(
                        s.like,
                        this.props.ownLike ? 'fa fa-thumbs-up' : 'fa fa-thumbs-o-up',
                      )}
                    />}
                </span>
              </div>
              {menu}
            </div>}
          <div className={s.text}>
            {this.state.edit
              ? <div>
                <textarea
                  placeholder="Leave a statement (optional)"
                  className={s.textEdit}
                  value={this.state.textArea.val}
                  onChange={this.onTextChange}
                />
              </div>
              : this.props.data.text}
          </div>
        </div>
      </div>
    );
  }
}
const mapDispatch = {
  createLike,
  deleteLike,
  deleteStatement,
  updateUser,
  flag,
  solveFlag,
};
const mapPropsToState = (state, { data }) => {
  const id = data.id || '0000'; // for creations
  return {
    mutationIsPending: getStatementMutationIsPending(state, id),
    mutationSuccess: getStatementMutationSuccess(state, id),
    mutationError: getStatementMutationError(state, id),
    user: getSessionUser(state),
    followees: getFollowees(state),
  };
};

export default connect(mapPropsToState, mapDispatch)(withStyles(s)(Statement));
