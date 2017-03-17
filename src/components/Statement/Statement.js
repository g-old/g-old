/* eslint-disable no-shadow */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import cn from 'classnames';
import s from './Statement.css';
import { createLike, deleteLike } from '../../actions/statement_like';
import { deleteStatement, updateStatement } from '../../actions/statement';

class Statement extends React.Component {
  static propTypes = {
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
    updateStatement: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onDeleteStatement = this.onDeleteStatement.bind(this);
    this.onEditStatement = this.onEditStatement.bind(this);
  }

  onDeleteStatement() {
    this.props.deleteStatement({
      pollId: this.props.data.pollId,
      id: this.props.data.id,
    });
  }

  onEditStatement() {
    this.props.updateStatement({
      pollId: this.props.data.pollId,
      id: this.props.data.id,
      text: 'my new updated text',
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
    return (
      <div className={cn(s.root, this.props.data.vote.position === 'pro' ? s.pro : s.contra)}>
        <span className={s.likes}>
          <button
            onClick={e => this.handleLikeClick(e, this.props.ownLike)}
            className={this.props.ownLike ? s.liked : s.notLiked}
          >
            {this.props.ownLike ? '+' : ''}
            {this.props.data.likes}
          </button>
          <br />
          {this.props.ownStatement &&
            <span>
              <button onClick={this.onEditStatement}>
                EDIT
              </button>
              <button onClick={this.onDeleteStatement}>
                DELETE
              </button>
            </span>}
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
          {this.props.data.text}
        </div>
      </div>
    );
  }
}
const mapDispatch = {
  createLike,
  deleteLike,
  deleteStatement,
  updateStatement,
};

export default connect(null, mapDispatch)(withStyles(s)(Statement));
