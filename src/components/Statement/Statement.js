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
    onSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      vote: PropTypes.shape({
        position: PropTypes.string.isRequired,
      }),
      pollId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      author: PropTypes.shape({
        name: PropTypes.string,
        surname: PropTypes.string,
      }),
    }),
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    ownLike: PropTypes.object,
    ownStatement: PropTypes.bool,
    deleteStatement: PropTypes.func,
    hideStatement: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.data.text || '' },
      edit: false,
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
    this.setState({ ...this.state, edit: false });
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
    return (
      <div className={cn(s.root, this.props.data.vote.position === 'pro' ? s.pro : s.contra)}>
        <span className={s.likes}>
          {this.props.ownStatement &&
            <span style={{ marginRight: '0.5em' }}>
              {this.state.edit
                ? <span>
                  <button onClick={this.onTextSubmit}>
                      SAVE
                    </button>
                  <button onClick={this.onEndEditing}>
                      CANCEL
                    </button>
                </span>
                : <button onClick={this.onEditStatement}>
                    EDIT
                  </button>}
              <button onClick={this.onDeleteStatement}>
                DELETE
              </button>
            </span>}
          <button
            onClick={e => this.handleLikeClick(e, this.props.ownLike)}
            className={this.props.ownLike ? s.liked : s.notLiked}
          >
            {this.props.ownLike ? '+' : ''}
            {this.props.data.likes}
          </button>
        </span>
        <img
          className={cn(s.avatar)}
          src={
            `https://api.adorable.io/avatars/256/${this.props.data.author.name}${this.props.data.author.surname}.io.png`
          }
          alt="IMG"
        />
        <div className={cn(s.author)}>
          {this.props.data.author.name} {this.props.data.author.surname}
        </div>
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
    );
  }
}
const mapDispatch = {
  createLike,
  deleteLike,
  deleteStatement,
};

export default connect(null, mapDispatch)(withStyles(s)(Statement));
