import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';
import VotesList from '../VotesList';
import Value from '../Value';
import { ICONS } from '../../constants';

class PollState extends React.Component {
  static propTypes = {
    compact: PropTypes.bool,
    allVoters: PropTypes.number.isRequired,
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number,
    threshold: PropTypes.number.isRequired,
    unipolar: PropTypes.bool.isRequired,
    votes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
    getVotes: PropTypes.func.isRequired,
    votingListIsFetching: PropTypes.bool.isRequired,
    votingListErrorMessage: PropTypes.string.isRequired,
  };

  static defaultProps = {
    compact: false,
    downvotes: 0,
    threshold: 50,
    /* threshold_ref: 'all', */
    votes: [],
    votingListIsFetching: false,
    votingListErrorMessage: 'error',
  };

  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    this.onToggleExpand = this.onToggleExpand.bind(this);
  }

  onToggleExpand() {
    const newExpand = !this.state.expand;
    this.setState({ ...this.state, expand: newExpand });
    if (newExpand) this.props.getVotes();
  }

  render() {
    const { compact, unipolar } = this.props;
    const voteClass = this.props.unipolar ? s.unipolar : s.bipolar;

    const sum = this.props.unipolar
      ? this.props.allVoters
      : this.props.upvotes + this.props.downvotes;

    const upPercent = sum > 0 ? 100 * (this.props.upvotes / sum) : 0;
    const voteBar = <div className={cn(s.bar)} style={{ width: `${upPercent}%` }} />;

    let numUpVotes = null;
    let numDownVotes = null;
    if (!compact) {
      if (!unipolar) {
        numDownVotes = (
          <Value
            value={this.props.downvotes}
            trendIcon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS.up}
                  transform="matrix(1 0 0 -1 0 24)"
                />
              </svg>
            }
          />
        );
      }
      numUpVotes = (
        <Value
          trendIcon={
            <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
              <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.up} />
            </svg>
          }
          value={this.props.upvotes}
        />
      );
    }
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    /* eslint-disable jsx-a11y/interactive-supports-focus */
    return (
      <div
        className={cn(s.root, this.props.compact && s.compact, voteClass)}
        onClick={!this.props.compact && this.onToggleExpand}
        role="button"
      >
        <div className={s.header}>
          {numUpVotes}
          <div className={s.barContainer}>
            {voteBar}
            <div
              className={cn(s.threshold)}
              style={{
                marginLeft: `${this.props.threshold}%`,
              }}
            />
          </div>
          {numDownVotes}
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
            {`THRESHOLD ${this.props.threshold}`}
            {!this.props.unipolar && this.props.threshold < 50 ? ' (IMPOSSIBLE)' : ''}
          </div>}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(PollState);
