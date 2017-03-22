import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import StatementsList from '../StatementsList';
import PollState from '../PollState';
import s from './Poll.css';

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
      statements: PropTypes.arrayOf(PropTypes.object),
      upvotes: PropTypes.number,
      downvotes: PropTypes.number,
      ownVote: PropTypes.shape({
        id: PropTypes.string,
        position: PropTypes.string,
      }),
      mode: PropTypes.shape({
        with_statements: PropTypes.bool,
        unipolar: PropTypes.bool,
        threshold_ref: PropTypes.string,
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
    }),
    user: PropTypes.object.isRequired,
    onVoteButtonClicked: PropTypes.func.isRequired,
    onStatementSubmit: PropTypes.func,
    onDeleteStatement: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleRetractVote = this.handleRetractVote.bind(this);
  }

  getFolloweeVotes(pos) {
    return (
      <div>
        {this.props.poll.followees
          .filter(user => user.position === pos)
          .map(user => (
            <img
              className={s.followee}
              src={
                `https://api.adorable.io/avatars/256/${user.voter.name}${user.voter.surname}.io.png`
              }
              title={`${user.voter.name} ${user.voter.surname}`}
              alt="IMG"
            />
          ))}
      </div>
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
    this.props.onStatementSubmit(
      {
        ...input,
        pollId: this.props.poll.id,
        vote: this.props.poll.ownVote,
      },
      update,
    );
  }

  render() {
    const withStatements = this.props.poll.mode.with_statements;
    let statements = null;
    // render StatementsList or not?
    if (withStatements) {
      statements = (
        <StatementsList
          statements={this.props.poll.statements}
          likedStatements={this.props.poll.likedStatements}
          pollId={this.props.poll.id}
          user={this.props.user}
          voted={this.props.poll.ownVote != null}
          ownStatement={this.props.poll.ownStatement}
          onSubmit={this.handleOnSubmit}
        />
      );
    }
    let votingButtons = null;

    if (!this.props.poll.closed_at) {
      // TODO Find better check
      // eslint-disable-next-line no-nested-ternary
      const proBtnColor = this.props.poll.ownVote
        ? this.props.poll.ownVote.position === 'pro' ? 'green' : ''
        : '';
      // eslint-disable-next-line no-nested-ternary
      const conBtnColor = this.props.poll.ownVote
        ? this.props.poll.ownVote.position === 'con' ? 'green' : ''
        : '';
      if (this.props.poll.mode.unipolar) {
        votingButtons = (
          <button onClick={() => this.canVote('pro')} style={{ background: proBtnColor }}>
            {' '}WANT TO VOTE{' '}
          </button>
        );
      } else if (this.props.poll.ownStatement) {
        votingButtons = (
          <button onClick={this.handleRetractVote}>
            RETRACT VOTE - AND DELETE STATEMENT
          </button>
        );
      } else {
        votingButtons = (
          <span>
            <button onClick={() => this.canVote('pro')} style={{ background: proBtnColor }}>
              {' '}YES{' '}
            </button>
            <button onClick={() => this.canVote('con')} style={{ background: conBtnColor }}>
              {' '}NO{' '}
            </button>
          </span>
        );
      }
    }

    return (
      <div>
        <div className={s.pollState}>
          <PollState
            showVoteCount="true"
            allVoters={this.props.poll.allVoters}
            upvotes={this.props.poll.upvotes}
            downvotes={this.props.poll.downvotes}
            unipolar={this.props.poll.mode.unipolar}
            threshold={this.props.poll.threshold}
            threshold_ref={this.props.poll.mode.threshold_ref}
          />
        </div>
        <div className={s.followeeContainer}>
          <div className={s.followeeBlock}>
            {this.getFolloweeVotes('pro')}
          </div>
          <div className={cn(s.followeeBlock, s.contra)}>
            {this.getFolloweeVotes('contra')}
          </div>
        </div>
        <p>
          {`CLOSES AT ${this.props.poll.end_time}`}
        </p>
        {votingButtons}
        {statements}
      </div>
    );
  }
}

export default withStyles(s)(Poll);
