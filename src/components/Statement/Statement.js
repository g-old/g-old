/* eslint-disable no-shadow */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import cn from 'classnames';
import s from './Statement.css';
import { createLike, deleteLike } from '../../actions/statement_like';

class Statement extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      title: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      vote: PropTypes.shape({
        position: PropTypes.string.isRequired,
      }),
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
  };

  handleLikeClick(e, like) {
    if (!like) {
      this.props.createLike({
        statementId: this.props.data.id,
      });
    } else {
      this.props.deleteLike({
        statementId: this.props.data.id,
        likeId: like.id,
      },
      );
    }
    e.preventDefault();
  }

  render() {
    return (
      <div className={cn(s.root, this.props.data.vote.position === 'pro' ? s.pro : s.contra)}>
        <span className={s.likes}>
          <button
            onClick={(e) => this.handleLikeClick(e, this.props.ownLike)}
            className={this.props.ownLike ? s.liked : s.notLiked}
          >
            {this.props.ownLike ? '+' : ''}
            {this.props.data.likes}
          </button>
          <br />
          {this.props.ownStatement && <span><button>EDIT</button><button>DELETE</button></span>}
        </span>
        <img className={cn(s.avatar)} src="https://api.adorable.io/avatars/256/gold@adorable.io.png" alt="IMG" />
        <div className={cn(s.author)}>
          {this.props.data.author.name} {this.props.data.author.surname}
        </div>
        <div className={s.title}>
          {this.props.data.title}
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
};

export default connect(null, mapDispatch)(withStyles(s)(Statement));
