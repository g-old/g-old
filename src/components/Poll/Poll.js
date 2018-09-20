import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import PollState from '../PollState';
import s from './Poll.css';
// import { ICONS } from '../../constants';
import Button from '../Button';
import Box from '../Box';
import Layer from '../Layer';
import Notification from '../Notification';
import history from '../../history';

const messages = defineMessages({
  closed: {
    id: 'poll.closed',
    defaultMessage: 'Ended',
    description: 'Poll closing time',
  },
  closing: {
    id: 'poll.closing',
    defaultMessage: 'Closing',
    description: 'Poll ending time',
  },
  retract: {
    id: 'poll.retractVote',
    defaultMessage: 'Retract your vote',
    description: 'Drawing back the vote',
  },
  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },

  notify: {
    id: 'poll.notify',
    defaultMessage: 'Your statement will be deleted!',
    description: 'Notice that vote change will lead to statement deletion',
  },
  error: {
    id: 'poll.voteError',
    defaultMessage: 'Voting failed!',
    description: 'Notice that voting was not successful',
  },
});

class Poll extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    threshold: PropTypes.number.isRequired,
    endTime: PropTypes.string.isRequired,
    allVoters: PropTypes.number.isRequired,
    ownStatement: PropTypes.shape({}),
    closedAt: PropTypes.string,
    // statements: PropTypes.arrayOf(PropTypes.object),
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number.isRequired,
    votes: PropTypes.arrayOf(PropTypes.shape({})),
    ownVote: PropTypes.shape({
      id: PropTypes.string,
      position: PropTypes.string,
      pollId: PropTypes.string,
    }),
    mode: PropTypes.shape({
      withStatements: PropTypes.bool,
      unipolar: PropTypes.bool,
      thresholdRef: PropTypes.string,
    }).isRequired,
    onVote: PropTypes.func.isRequired,
    onFetchVoters: PropTypes.func.isRequired,
    followeeVotes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    filter: PropTypes.string.isRequired,
    updates: PropTypes.shape({ vote: PropTypes.shape({}) }).isRequired,
    canVote: PropTypes.bool,
  };

  static defaultProps = {
    votes: null,
    ownVote: null,
    ownStatement: null,
    closedAt: null,
    canVote: null,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.voteUp = this.voteUp.bind(this);
    this.voteDown = this.voteDown.bind(this);
  }

  componentWillReceiveProps({ updates, id }) {
    const { id: oldId, updates: oldUpdates } = this.props;
    if (id === oldId && updates.vote) {
      let voteError;
      if (updates.vote.error) {
        const oldStatus = oldUpdates.vote || {};
        voteError = !oldStatus.error;
      }
      if (updates.vote.success) {
        voteError = false;
      }
      this.setState({ voteError });
    }
  }

  getFolloweeVotes(pos) {
    const { followeeVotes } = this.props;
    if (!followeeVotes) {
      return null;
    }
    return followeeVotes.filter(user => user.position === pos).map(user => (
      <img // eslint-disable-line
        onClick={() => {
          history.push(`/accounts/${user.voter.id}`);
        }}
        key={user.id}
        className={s.followee}
        src={user.voter.thumbnail}
        title={`${user.voter.name} ${user.voter.surname}`}
        alt="IMG"
      />
    ));
  }

  canVote(positions) {
    const { ownVote, ownStatement, id, onVote } = this.props;
    let method; // or take methods better directly in and connect to redux
    let info = null;

    if (!ownVote) {
      method = 'create';
    } else if (ownVote.positions[0].pos !== positions[0].pos) {
      method = 'update';
    } else {
      method = 'del';
    }
    const voteId = ownVote ? ownVote.id : null;
    if (ownStatement) {
      info = ownStatement.id;
      this.setState({
        confirmationFunc: () => {
          onVote({ vote: { positions, pollId: id, id: voteId } }, method, info);
          this.setState({ confirmationFunc: null });
        },
      });
      return;
    }
    onVote({ vote: { positions, pollId: id, id: voteId } }, method, info);
  }

  voteUp() {
    this.canVote([{ pos: 0, value: 1 }]);
  }

  voteDown() {
    this.canVote([{ pos: 1, value: 1 }]);
  }

  render() {
    const {
      id,
      ownVote,
      allVoters,
      options,
      threshold,
      mode,
      closedAt,
      endTime,
      votes,
      updates,
      onFetchVoters,
      canVote,
    } = this.props;
    const { confirmationFunc, voteError } = this.state;
    const upvotes = options[0].numVotes;
    let downvotes = 0;
    if (!mode.unipolar) {
      downvotes = options[1].numVotes;
    }
    let votingButtons = null;
    /* eslint-disable max-len */
    const votePending = updates.vote ? updates.vote.pending : false;
    if (canVote && !closedAt) {
      // TODO Find better check
      // eslint-disable-next-line no-nested-ternary
      const proBtnColor =
        ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 0
          ? s.proBtnColor
          : '';
      if (mode.unipolar) {
        votingButtons = (
          <div>
            <Button disabled={votePending} onClick={this.voteUp} plain>
              <img
                style={{ maxWidth: '5em', maxHeight: '5em' }}
                alt="Vote"
                src={proBtnColor ? '/abstimmung-01.png' : '/abstimmung-02.png'}
              />
              {/* <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                <path
                  fill="none"
                  stroke={proBtnColor ? '#ff324d' : '#666'}
                  strokeWidth="1"
                  d={ICONS.halt}
                />
              </svg> */}
            </Button>
          </div>
        );
      } else {
        // eslint-disable-next-line no-nested-ternary
        const conBtnColor =
          ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 1
            ? s.conBtnColor
            : '';
        votingButtons = (
          <div style={{ paddingBottom: '2em' }}>
            <Box pad>
              <Button plain onClick={this.voteUp} disabled={votePending}>
                <img
                  style={{ maxWidth: '5em', maxHeight: '5em' }}
                  alt="Vote"
                  src={
                    proBtnColor ? '/abstimmung-03.png' : '/abstimmung-04.png'
                  }
                />
                {/* <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                  <path
                    fill="none"
                    stroke={proBtnColor ? '#8cc800' : '#666'}
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                  />
              </svg> */}
              </Button>
              <Button plain onClick={this.voteDown} disabled={votePending}>
                <img
                  style={{ maxWidth: '5em', maxHeight: '5em' }}
                  alt="Vote"
                  src={
                    conBtnColor ? '/abstimmung-05.png' : '/abstimmung-06.png'
                  }
                />
                {/* <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                  <path
                    fill="none"
                    stroke={conBtnColor ? '#ff324d' : '#666'}
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                    transform="rotate(180 12 12)"
                  />
                </svg> */}
              </Button>
            </Box>
          </div>
        );
      }
    }

    return (
      <div>
        {confirmationFunc && (
          <Layer>
            <Box column pad className={s.confirmationBox}>
              <Notification
                type="alert"
                message={<FormattedMessage {...messages.notify} />}
              />
              <Box justify>
                <Button onClick={() => confirmationFunc()} label="Ok" />
                <Button
                  primary
                  label={<FormattedMessage {...messages.cancel} />}
                  onClick={() => {
                    this.setState({ confirmationFunc: null });
                  }}
                />
              </Box>
            </Box>
          </Layer>
        )}
        <p>
          {closedAt ? (
            <FormattedMessage {...messages.closed} />
          ) : (
            <FormattedMessage {...messages.closing} />
          )}
          &nbsp;
          <FormattedRelative value={closedAt || endTime} />
        </p>
        <div className={s.pollState}>
          <PollState
            pollId={id}
            allVoters={allVoters}
            upvotes={upvotes}
            downvotes={downvotes}
            unipolar={mode.unipolar}
            threshold={threshold}
            thresholdRef={mode.thresholdRef}
            votes={votes}
            getVotes={() => onFetchVoters(id)}
            updates={updates.fetchVoters || {}}
          />
        </div>
        <div className={s.followeeContainer}>
          <div className={s.followeeBlock}>{this.getFolloweeVotes('pro')}</div>
          <div className={cn(s.followeeBlock, s.contra)}>
            {this.getFolloweeVotes('con')}
          </div>
        </div>

        <Box justify>{votingButtons}</Box>
        {voteError && (
          <Notification
            type="error"
            message={<FormattedMessage {...messages.error} />}
          />
        )}
      </div>
    );
  }
}

export default withStyles(s)(Poll);
