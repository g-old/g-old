import React, { PropTypes } from 'react';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';

class PollState extends React.Component {
  static propTypes = {
    showVoteCount: PropTypes.bool,
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

    const upPercent = 100 * (this.props.upvotes / sum);
    const voteBar = <div className={cn(s.bar)} style={{ width: `${upPercent}%` }} />;

    const threshMargin = this.props.unipolar ? this.props.threshold : 100 - this.props.threshold;
    const doubleMargin = 2 * threshMargin;
    const threshWidth = 100 - doubleMargin;

    const greyZone = !this.props.unipolar &&
      upPercent > 100 - this.props.threshold &&
      upPercent < this.props.threshold
      ? s.greyZone
      : '';

    return (
      <div className={cn(s.root, voteClass)}>
        {this.props.showVoteCount
          ? <div className={s.votes}>
            {this.props.upvotes}
          </div>
          : ''}
        <div className={s.barContainer}>
          {voteBar}
          <div
            className={cn(s.threshold, greyZone)}
            style={{ marginLeft: `${threshMargin}%`, width: `${threshWidth}%` }}
          />
        </div>
        {this.props.showVoteCount
          ? <div className={s.votes} style={{ textAlign: 'right' }}>
            {!this.props.unipolar ? `${this.props.downvotes}` : ''}
          </div>
          : ''}
      </div>
    );
  }
}

export default withStyles(s)(PollState);
