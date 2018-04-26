import * as React from 'react';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';
import VotesList from '../VotesList';
import Value from '../Value';
import { ICONS } from '../../constants';

// @flow
type Props = {
  pollId: string,
  compact?: boolean,
  allVoters: number,
  upvotes: number,
  downvotes?: number,
  threshold?: number,
  unipolar: boolean,
  votes?: { id: string }[],
  getVotes?: () => void,
  updates?: {
    isPending: boolean,
    error: React.Node,
  },
};

class PollState extends React.Component<Props> {
  static defaultProps = {
    compact: false,
    downvotes: 0,
    threshold: 50,
    /* threshold_ref: 'all', */
    votes: null,
    updates: null,
    getVotes: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    this.onToggleExpand = this.onToggleExpand.bind(this);
  }

  componentWillReceiveProps({ pollId }) {
    if (pollId !== this.props.pollId) {
      this.setState({ expand: false });
    }
  }
  onToggleExpand() {
    const newExpand = !this.state.expand;
    this.setState({ ...this.state, expand: newExpand });
    if (newExpand) this.props.getVotes();
  }

  render() {
    const { compact, unipolar, updates } = this.props;
    const voteClass = this.props.unipolar ? s.unipolar : s.bipolar;

    const sum = this.props.unipolar
      ? this.props.allVoters
      : this.props.upvotes + this.props.downvotes;

    const upPercent = sum > 0 ? 100 * (this.props.upvotes / sum) : 0;
    const voteBar = (
      <div className={cn(s.bar)} style={{ width: `${upPercent}%` }} />
    );

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
    /* eslint-disable jsx-a11y/click-events-have-key-events */

    return (
      <div
        className={cn(s.root, this.props.compact && s.compact, voteClass)}
        onClick={this.props.compact ? null : this.onToggleExpand}
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
        {this.state.expand && (
          <div className={s.votesList}>
            <VotesList
              autoLoadVotes
              unipolar={this.props.unipolar}
              votes={this.props.votes}
              isFetching={(updates && updates.isPending) || false}
              errorMessage={updates && updates.error}
              getVotes={this.props.getVotes}
            />
            {!this.props.unipolar && this.props.threshold < 50
              ? ' (IMPOSSIBLE)'
              : ''}
          </div>
        )}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(PollState);
