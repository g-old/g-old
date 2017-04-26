import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';
import VotesList from '../VotesList';

class PollState extends React.Component {
  static propTypes = {
    compact: PropTypes.bool,
    allVoters: PropTypes.number,
    upvotes: PropTypes.number,
    downvotes: PropTypes.number,
    threshold: PropTypes.number,
    unipolar: PropTypes.bool,
    threshold_ref: PropTypes.string,
    votes: PropTypes.arrayOf(PropTypes.object),
    getVotes: PropTypes.func.isRequired,
    votingListIsFetching: PropTypes.bool,
    votingListErrorMessage: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    this.onToggleExpand = this.onToggleExpand.bind(this);
  }

  onToggleExpand() {
    this.setState({ ...this.state, expand: !this.state.expand });
    this.props.getVotes();
  }

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

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        className={cn(s.root, this.props.compact && s.compact, voteClass)}
        onClick={!this.props.compact && this.onToggleExpand}
        role="button"
      >
        <div className={s.header}>
          {!this.props.compact
            ? <div className={s.voteCount}>
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
          {!this.props.compact
            ? <div className={s.voteCount} style={{ textAlign: 'right' }}>
              {!this.props.unipolar ? `${this.props.downvotes}` : ''}
            </div>
            : ''}
        </div>
        {this.state.expand &&
          <div className={s.votesList}>
            <VotesList
              autoLoadVotes
              unipolar={this.props.unipolar}
              votes={this.props.votes}
              isFetching={this.props.votingListIsFetching}
              errorMessage={this.props.votingListErrorMessage}
            />
          </div>}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(PollState);
