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
    updates: {},
    votes: null,
    ownVote: null,
    ownStatement: null,
    closedAt: null,
    canVote: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.handleRetractVote = this.handleRetractVote.bind(this);
  }

  componentWillReceiveProps({ updates, id }) {
    if (id === this.props.id && updates.vote) {
      let voteError;
      if (updates.vote.error) {
        const oldStatus = this.props.updates.vote || {};
        voteError = !oldStatus.error;
      }
      if (updates.vote.success) {
        voteError = false;
      }
      this.setState({ voteError });
    }
  }

  getFolloweeVotes(pos) {
    if (!this.props.followeeVotes) {
      return null;
    }
    return this.props.followeeVotes
      .filter(user => user.position === pos)
      .map(user => (
        <img
          key={user.id}
          className={s.followee}
          src={user.voter.thumbnail}
          title={`${user.voter.name} ${user.voter.surname}`}
          alt="IMG"
        />
      ));
  }

  canVote(position) {
    const { ownVote, ownStatement, id } = this.props;
    let method; // or take methods better directly in and connect to redux
    let info = null;

    if (!ownVote) {
      method = 'create';
    } else if (ownVote.position !== position) {
      method = 'update';
    } else {
      method = 'del';
    }
    const voteId = ownVote ? ownVote.id : null;
    if (ownStatement) {
      info = ownStatement.id;
      this.setState({
        confirmationFunc: () => {
          this.props.onVote({ position, pollId: id, id: voteId }, method, info);
          this.setState({ confirmationFunc: null });
        },
      });
      return;
    }
    this.props.onVote({ position, pollId: id, id: voteId }, method, info);
  }

  handleRetractVote() {
    const { ownVote, ownStatement } = this.props;
    // TODO Add some sort of validation
    // will delete vote and the statement too bc of cascade on delete
    this.canVote(ownVote.position, ownStatement.id);
  }

  render() {
    const {
      id,
      ownVote,
      allVoters,
      upvotes,
      downvotes,
      threshold,
      mode,
      closedAt,
      endTime,
      votes,
      updates,
      onFetchVoters,
      canVote,
    } = this.props;

    let votingButtons = null;
    /* eslint-disable max-len */
    const votePending = updates.vote ? updates.vote.pending : false;
    if (canVote && !closedAt) {
      // TODO Find better check
      // eslint-disable-next-line no-nested-ternary
      const proBtnColor =
        ownVote && ownVote.position === 'pro' ? s.proBtnColor : '';
      if (mode.unipolar) {
        votingButtons = (
          <div>
            <Button
              disabled={votePending}
              onClick={() => this.canVote('pro')}
              plain
            >
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
          ownVote && ownVote.position === 'con' ? s.conBtnColor : '';
        votingButtons = (
          <div style={{ paddingBottom: '2em' }}>
            <Box pad>
              <Button
                plain
                onClick={() => this.canVote('pro')}
                disabled={votePending}
              >
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
              <Button
                plain
                onClick={() => this.canVote('con')}
                disabled={votePending}
              >
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
        {this.state.confirmationFunc && (
          <Layer>
            <Box column pad className={s.confirmationBox}>
              <Notification
                type="alert"
                message={<FormattedMessage {...messages.notify} />}
              />
              <Box justify>
                <Button
                  onClick={() => this.state.confirmationFunc()}
                  label={'Ok'}
                />
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
          &nbsp;<FormattedRelative value={closedAt || endTime} />
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
        {this.state.voteError && (
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
