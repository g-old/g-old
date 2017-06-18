import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedRelative, defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import StatementsList from '../StatementsList';
import PollState from '../PollState';
import s from './Poll.css';
import { ICONS } from '../../constants';
import Button from '../Button';
import Box from '../Box';
import {
  getVotingListIsFetching,
  getVotingListErrorMessage,
  getVoteMutationIsPending,
  //  getVoteMutationSuccess,
  getVoteMutationError,
  getFolloweeVotesByPoll,
  getFollowees,
  getVisibibleStatementsByPoll,
} from '../../reducers';

const messages = defineMessages({
  closed: {
    id: 'poll.closed',
    defaultMessage: 'Closed at',
    description: 'Poll closing time',
  },
  closing: {
    id: 'poll.closing',
    defaultMessage: 'Closing at',
    description: 'Poll ending time',
  },
  retract: {
    id: 'poll.retractVote',
    defaultMessage: 'Retract your vote',
    description: 'Drawing back the vote',
  },
});

class Poll extends React.Component {
  static propTypes = {
    poll: PropTypes.shape({
      id: PropTypes.string,
      secret: PropTypes.bool,
      threshold: PropTypes.number,
      start_time: PropTypes.string,
      end_time: PropTypes.string,
      allVoters: PropTypes.number,
      ownStatement: PropTypes.object,
      closed_at: PropTypes.string,
      // statements: PropTypes.arrayOf(PropTypes.object),
      upvotes: PropTypes.number,
      downvotes: PropTypes.number,
      votes: PropTypes.arrayOf(PropTypes.object),
      ownVote: PropTypes.shape({
        id: PropTypes.string,
        position: PropTypes.string,
        pollId: PropTypes.string,
      }),
      mode: PropTypes.shape({
        withStatements: PropTypes.bool,
        unipolar: PropTypes.bool,
        thresholdRef: PropTypes.string,
      }),
      likedStatements: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        }),
      ),
      followees: PropTypes.arrayOf(
        PropTypes.shape({
          position: PropTypes.string,
          voter: PropTypes.object,
        }),
      ),
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }).isRequired,
    fetchVotes: PropTypes.func.isRequired,
    onVoteButtonClicked: PropTypes.func.isRequired,
    onStatementSubmit: PropTypes.func.isRequired,
    // mutationSuccess: PropTypes.bool.isRequired,
    mutationErrorMessage: PropTypes.string.isRequired,
    mutationIsPending: PropTypes.bool.isRequired,
    votingListIsFetching: PropTypes.bool.isRequired,
    votingListErrorMessage: PropTypes.string.isRequired,
    followeeVotes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    followees: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    statements: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    filter: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleRetractVote = this.handleRetractVote.bind(this);
  }

  getFolloweeVotes(pos) {
    if (!this.props.followeeVotes) {
      return null;
    }
    return this.props.followeeVotes
      .filter(user => user.position === pos)
      .map(user =>
        (<img
          key={user.id}
          className={s.followee}
          src={user.voter.avatar}
          title={`${user.voter.name} ${user.voter.surname}`}
          alt="IMG"
        />),
      );
  }

  canVote(position) {
    let method; // or take methods better directly in and connect to redux

    if (!this.props.poll.ownVote) {
      method = 'create';
    } else if (this.props.poll.ownVote.position !== position) {
      method = 'update';
    } else {
      method = 'del';
    }
    const id = this.props.poll.ownVote ? this.props.poll.ownVote.id : null;
    this.props.onVoteButtonClicked({ position, pollId: this.props.poll.id, id }, method);
  }

  handleRetractVote() {
    // TODO Add some sort of validation
    // will delete vote and the statement too bc of cascade on delete
    this.canVote(this.props.poll.ownVote.position);
  }

  handleOnSubmit(input, update) {
    if (!this.props.poll.ownVote) {
      alert('CHANGE: ADMIN/MODS CANNOT EDIT ANYMORE!');
    } else {
      const { id, pollId, position } = this.props.poll.ownVote;
      this.props.onStatementSubmit(
        {
          ...input,
          pollId: this.props.poll.id,
          vote: { id, pollId, position },
        },
        update,
      );
    }
  }

  render() {
    const { poll: { ownVote }, filter } = this.props;
    const withStatements = this.props.poll.mode.withStatements;
    let statements = null;

    let hideOwnStatement = true;
    if (filter === 'ids' || (ownVote && filter === ownVote.position)) {
      hideOwnStatement = false;
    }

    // render StatementsList or not?
    if (withStatements) {
      statements = (
        <StatementsList
          statements={this.props.statements}
          likedStatements={this.props.poll.likedStatements}
          pollId={this.props.poll.id}
          user={this.props.user}
          voted={this.props.poll.ownVote != null}
          ownStatement={this.props.poll.ownStatement}
          onSubmit={this.handleOnSubmit}
          ownVote={this.props.poll.ownVote}
          followees={this.props.followees}
          hideOwnStatement={hideOwnStatement}
        />
      );
    }
    let votingButtons = null;
    const { mutationIsPending, mutationErrorMessage } = this.props;

    if (!this.props.poll.closed_at && !['viewer', 'guest'].includes(this.props.user.role.type)) {
      // TODO Find better check
      // eslint-disable-next-line no-nested-ternary
      const proBtnColor = this.props.poll.ownVote && this.props.poll.ownVote.position === 'pro'
        ? s.proBtnColor
        : '';
      // eslint-disable-next-line no-nested-ternary
      const conBtnColor = this.props.poll.ownVote && this.props.poll.ownVote.position === 'con'
        ? s.conBtnColor
        : '';
      if (this.props.poll.mode.unipolar) {
        votingButtons = (
          <div>
            <Button disabled={mutationIsPending} onClick={() => this.canVote('pro')} plain>
              Stop this!
              <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                <path
                  fill="none"
                  stroke={proBtnColor ? '#ff324d' : '#666'}
                  strokeWidth="1"
                  d={ICONS.halt}
                />
              </svg>
            </Button>
            {/* <button
              className={cn(proBtnColor)}
              disabled={mutationIsPending}
              onClick={() => this.canVote('pro')}
            >

              <i className="fa fa-hand-paper-o" />
            </button>*/}
            {mutationErrorMessage && <div>{mutationErrorMessage} </div>}
          </div>
        );
      } else if (this.props.poll.ownStatement) {
        votingButtons = (
          <div>
            <Button disabled={mutationIsPending} onClick={this.handleRetractVote}>
              <FormattedMessage {...messages.retract} />
            </Button>
            {mutationErrorMessage && <div>{mutationErrorMessage} </div>}
          </div>
        );
      } else {
        votingButtons = (
          <div style={{ paddingBottom: '2em' }}>
            <Box pad>
              <Button plain onClick={() => this.canVote('pro')} disabled={mutationIsPending}>
                <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                  <path
                    fill="none"
                    stroke={proBtnColor ? '#8cc800' : '#666'}
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                  />
                </svg>
              </Button>
              <Button plain onClick={() => this.canVote('con')} disabled={mutationIsPending}>
                <svg viewBox="0 0 24 24" width="60px" height="60px" role="img" aria-label="halt">
                  <path
                    fill="none"
                    stroke={conBtnColor ? '#ff324d' : '#666'}
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                    transform="rotate(180 12 12)"
                  />
                </svg>
              </Button>
            </Box>
            {mutationErrorMessage && <div>{mutationErrorMessage} </div>}
          </div>
        );
      }
    }
    return (
      <div>
        <p>
          {this.props.poll.closed_at
            ? <FormattedMessage {...messages.closed} />
            : <FormattedMessage {...messages.closing} />}
          <FormattedRelative
            value={this.props.poll.closed_at ? this.props.poll.closed_at : this.props.poll.end_time}
          />

        </p>
        <div className={s.pollState}>
          <PollState
            allVoters={this.props.poll.allVoters}
            upvotes={this.props.poll.upvotes}
            downvotes={this.props.poll.downvotes}
            unipolar={this.props.poll.mode.unipolar}
            threshold={this.props.poll.threshold}
            thresholdRef={this.props.poll.mode.thresholdRef}
            votes={this.props.poll.votes || []}
            getVotes={() => this.props.fetchVotes(this.props.poll.id)}
            votingListIsFetching={this.props.votingListIsFetching}
            votingListErrorMessage={this.props.votingListErrorMessage}
          />
        </div>
        <div className={s.followeeContainer}>
          <div className={s.followeeBlock}>
            {this.getFolloweeVotes('pro')}
          </div>
          <div className={cn(s.followeeBlock, s.contra)}>
            {this.getFolloweeVotes('con')}
          </div>
        </div>

        <Box justify>
          {mutationErrorMessage && <div> {'ERROR:'} </div>}
          {votingButtons}
        </Box>
        {statements}
      </div>
    );
  }
}
const mapPropsToState = (state, { poll: { id }, filter }) => {
  const statements = getVisibibleStatementsByPoll(state, id, filter);
  if (statements) {
    statements.sort((a, b) => b.likes - a.likes);
  }
  return {
    votingListIsFetching: getVotingListIsFetching(state, id),
    votingListErrorMessage: getVotingListErrorMessage(state, id),
    mutationIsPending: getVoteMutationIsPending(state, id),
    // mutationSuccess: getVoteMutationSuccess(state, id),
    mutationErrorMessage: getVoteMutationError(state, id),
    followeeVotes: getFolloweeVotesByPoll(state, id),
    followees: getFollowees(state),
    statements,
  };
};

export default connect(mapPropsToState)(withStyles(s)(Poll));
