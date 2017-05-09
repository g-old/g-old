/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import cn from 'classnames';
import s from './Statement.css';
import { createLike, deleteLike } from '../../actions/statement_like';
import { updateUser } from '../../actions/user';
import { deleteStatement, flag } from '../../actions/statement';
import Icon from '../Icon';
import {
  getStatementMutationIsPending,
  getStatementMutationSuccess,
  getStatementMutationError,
  getSessionUser,
} from '../../reducers';

class Statement extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    data: PropTypes.shape({
      id: PropTypes.string,
      vote: PropTypes.shape({
        position: PropTypes.string.isRequired,
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
    }).isRequired,
    isFollowee: PropTypes.bool.isRequired,
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    flag: PropTypes.func.isRequired,
    ownLike: PropTypes.shape({ id: PropTypes.string }),
    ownStatement: PropTypes.bool,
    deleteStatement: PropTypes.func.isRequired,
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
  }

  onDeleteStatement() {
    this.props.deleteStatement({
      pollId: this.props.data.pollId,
      id: this.props.data.id,
    });
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
    const isEmpty = this.state.textArea.val.length === 0;
    const hasMinimumInput = this.state.textArea.val.length >= 5;
    const inactive = this.props.asInput && isEmpty;
    const canLike =
      this.props.user.role.type !== 'guest' && !this.props.asInput && !this.props.ownStatement;
    return (
      <div
        className={cn(
          s.root,
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
              {!this.props.ownStatement &&
                !this.props.isFollowee &&
                <button
                  onClick={() => {
                    alert('IMPLEMENT FOLLOWING');
                    this.props.updateUser({
                      id: this.props.user.id,
                      followee: this.props.data.author.id,
                    });
                  }}
                >
                  {' '}+Follow{' '}
                </button>}
              {!this.props.ownStatement &&
                <button
                  className={s.iconButton}
                  onClick={() =>
                    this.props.flag({
                      statementId: this.props.data.id,
                      content: this.props.data.text,
                    })}
                >
                  <Icon
                    icon={
                      'M0 0h4v32h-4v-32z M26 20.094c2.582 0 4.83-0.625 6-1.547v-16c-1.17 0.922-3.418 1.547-6 1.547s-4.83-0.625-6-1.547v16c1.17 0.922 3.418 1.547 6 1.547z M19 1.016c-1.466-0.623-3.61-1.016-6-1.016-3.012 0-5.635 0.625-7 1.547v16c1.365-0.922 3.988-1.547 7-1.547 2.39 0 4.534 0.393 6 1.016v-16z'
                    }
                    size={16}
                    color={'grey'}
                  />
                </button>}
              <span className={s.menu}>
                {(this.props.asInput ||
                  this.props.ownStatement ||
                  ['admin', 'mod'].includes(this.props.user.role.type)) &&
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
                    {!this.props.asInput &&
                      <button onClick={this.onDeleteStatement}>
                        <i className="fa fa-trash" />
                      </button>}
                  </span>}
              </span>
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
};
const mapPropsToState = (state, { data }) => {
  const id = data.id || '0000'; // for creations
  return {
    mutationIsPending: getStatementMutationIsPending(state, id),
    mutationSuccess: getStatementMutationSuccess(state, id),
    mutationError: getStatementMutationError(state, id),
    user: getSessionUser(state),
  };
};

export default connect(mapPropsToState, mapDispatch)(withStyles(s)(Statement));
