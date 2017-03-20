import React, { PropTypes } from 'react';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';

class PollState extends React.Component {
  static propTypes = {
    allVoters: PropTypes.number,
    upvotes: PropTypes.number,
    downvotes: PropTypes.number,
    threshold: PropTypes.number,
    unipolar: PropTypes.bool,
    threshold_ref: PropTypes.string,
  };
  render() {
    const voteClass = this.props.unipolar ? s.unipolar : s.bipolar;

    const sum = this.props.unipolar
      ? this.props.allVoters
      : this.props.upvotes + this.props.downvotes;

    const percent = `${100 * (this.props.upvotes / sum)}%`;
    const voteBar = <div className={cn(s.bar)} style={{ width: percent }} />;

    const threshMargin = this.props.threshold < 50
      ? this.props.threshold
      : 100 - this.props.threshold;
    const threshWidth = 100 - threshMargin - threshMargin;

    return (
      <div className={cn(s.root, voteClass)}>
        <div className={s.votes}>
          {this.props.upvotes}
        </div>
        <div className={s.barContainer}>
          {voteBar}
          <div
            className={s.threshold}
            style={{ marginLeft: `${threshMargin}%`, width: `${threshWidth}%` }}
          />
        </div>
        <div className={s.votes} style={{ textAlign: 'right' }}>
          {!this.props.unipolar ? `${this.props.downvotes}` : ''}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(PollState);
