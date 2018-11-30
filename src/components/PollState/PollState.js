import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';
import VotesList from '../VotesList';

class PollState extends React.Component {
  static propTypes = {
    pollId: PropTypes.string.isRequired,
    compact: PropTypes.bool,
    allVoters: PropTypes.number.isRequired,
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number,
    threshold: PropTypes.number,
    unipolar: PropTypes.bool.isRequired,
    votes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    getVotes: PropTypes.func,
    updates: PropTypes.shape({
      isPending: PropTypes.bool,
      error: PropTypes.node,
    }),
  };

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
    const { pollId: oldPollId } = this.props;
    if (pollId !== oldPollId) {
      this.setState({ expand: false });
    }
  }

  onToggleExpand() {
    const { expand } = this.state;
    const { getVotes } = this.props;
    this.setState(prevState => ({ expand: !prevState.expand }));
    if (!expand) getVotes();
  }

  render() {
    const {
      compact,
      unipolar,
      updates,
      threshold,
      votes,
      getVotes,
      upvotes,
      downvotes,
      allVoters,
    } = this.props;
    const { expand } = this.state;
    const voteClass = unipolar ? s.unipolar : s.bipolar;

    const sum = unipolar ? allVoters : upvotes + downvotes;

    const upPercent = sum > 0 ? 100 * (upvotes / sum) : 0;
    const voteBar = (
      <div className={cn(s.bar)} style={{ width: `${upPercent}%` }} />
    );

    let numUpVotes = null;
    let numDownVotes = null;
    if (!compact) {
      if (!unipolar) {
        numDownVotes = <div>{downvotes}</div>;
      }
      numUpVotes = <div>{upvotes}</div>;
    }
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    /* eslint-disable jsx-a11y/interactive-supports-focus */
    /* eslint-disable jsx-a11y/click-events-have-key-events */

    return (
      <div
        className={cn(s.root, compact && s.compact, voteClass)}
        onClick={compact ? null : this.onToggleExpand}
        role="button"
      >
        <div className={s.header}>
          <span className={cn(s.voteCount)}>
            {numUpVotes}
            {numDownVotes}
          </span>

          <div className={s.barContainer}>
            {voteBar}
            <div
              className={cn(s.threshold)}
              style={{
                marginLeft: `${threshold}%`,
              }}
            />
          </div>
        </div>
        {expand && (
          <div className={s.votesList}>
            <VotesList
              autoLoadVotes
              unipolar={unipolar}
              votes={votes}
              isFetching={(updates && updates.isPending) || false}
              errorMessage={updates && updates.error}
              getVotes={getVotes}
            />
            {!unipolar && threshold < 50 ? ' (IMPOSSIBLE)' : ''}
          </div>
        )}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(PollState);
