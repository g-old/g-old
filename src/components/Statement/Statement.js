/* eslint-disable no-shadow */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import cn from 'classnames';
import s from './Statement.css';
import { createLike, deleteLike } from '../../actions/statement_like';
import { deleteStatement } from '../../actions/statement';

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
      }),
    }),
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    ownLike: PropTypes.object,
    ownStatement: PropTypes.bool,
    deleteStatement: PropTypes.func,
    user: PropTypes.object,
    asInput: PropTypes.bool,
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
      });
    } else {
      this.props.deleteLike({
        statementId: this.props.data.id,
        likeId: like.id,
      });
    }
    e.preventDefault();
  }

  render() {
    const isEmpty = this.state.textArea.val.length === 0;
    const hasMinimumInput = this.state.textArea.val.length >= 5;
    const inactive = this.props.asInput && isEmpty;
    const canLike = this.props.user.role !== 'guest' &&
      !this.props.asInput &&
      !this.props.ownStatement;

    return (
      <div
        className={cn(
          s.root,
          this.props.data.vote.position === 'pro' ? s.pro : s.contra,
          inactive && s.inactive,
        )}
      >
        {!inactive &&
          <img
            className={cn(s.avatar)}
            src={
              this.props.data.author.avatar
                ? this.props.data.author.avatar
                : `https://api.adorable.io/avatars/256/${this.props.data.author.name}${this.props.data.author.surname}.io.png`
            }
            alt="IMG"
          />}
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
              <span className={s.menu}>
                {(this.props.asInput ||
                  this.props.ownStatement ||
                  ['admin', 'mod'].includes(this.props.user.role)) &&
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
};
const mapPropsToState = state => ({ user: state.entities.users[state.user] });

export default connect(mapPropsToState, mapDispatch)(withStyles(s)(Statement));
