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
    }),
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    ownLike: PropTypes.object,
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
        <div>
          {this.props.data.title}
        </div>
        <div>
          {this.props.data.text}
        </div>
        <span>
          {this.props.data.likes}
          <button
            onClick={(e) => this.handleLikeClick(e, this.props.ownLike)}
            style={{ background: this.props.ownLike ? 'red' : '' }}
          >
            {this.props.ownLike ? 'Liked' : 'Like'}
          </button>
        </span>
      </div>
    );
  }
}
const mapDispatch = {
  createLike,
  deleteLike,
};

export default connect(null, mapDispatch)(withStyles(s)(Statement));