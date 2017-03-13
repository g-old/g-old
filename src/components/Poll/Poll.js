import React, { PropTypes } from 'react';
import StatementsList from '../StatementsList';
import PollState from '../PollState';

class Poll extends React.Component {

  static propTypes= {
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
      likedStatements: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        statementId: PropTypes.string,
      })),
    }),
    user: PropTypes.object.isRequired,
    onVoteButtonClicked: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {};
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

  render() {
    const withStatements = this.props.poll.mode.with_statements;
    let statements = null;
    // render StatementsList or not?
    if (withStatements) {
      statements = (<StatementsList
        statements={this.props.poll.statements}
        likedStatements={this.props.poll.likedStatements}
        pollId={this.props.poll.id}
        user={this.props.user}
        voted={this.props.poll.ownVote != null}
        ownStatement={this.props.poll.ownStatement}
      />);
    }
    let votingButtons = null;

    if (!this.props.poll.closed_at) { // TODO Find better check
      // eslint-disable-next-line no-nested-ternary
      const proBtnColor = this.props.poll.ownVote ? (this.props.poll.ownVote.position === 'pro' ? 'green' : '') : '';
      // eslint-disable-next-line no-nested-ternary
      const conBtnColor = this.props.poll.ownVote ? (this.props.poll.ownVote.position === 'con' ? 'green' : '') : '';
      if (this.props.poll.mode.unipolar) {
        votingButtons = <button onClick={() => this.canVote('pro')} style={{ background: proBtnColor }}> WANT TO VOTE </button>;
      } else {
        console.log('RENDER POLL');
        console.log(this.props.poll);

        votingButtons = (<span>
          <button
            onClick={() => this.canVote('pro')}
            style={{ background: proBtnColor }}
          > YES </button>
          <button
            onClick={() => this.canVote('con')}
            style={{ background: conBtnColor }}
          > NO </button>
        </span>);
      }
    }

    return (
      <div>
        <PollState
          allVoters={this.props.poll.allVoters}
          upvotes={this.props.poll.upvotes}
          downvotes={this.props.poll.downvotes}
          threshold={this.props.poll.threshold}
          threshold_ref={this.props.poll.mode.threshold_ref}
        />
        <p>
          {`CLOSES AT ${this.props.poll.end_time}`}
          <br />
          {'FOLLOWEE VOTES HERE'}
        </p>
        {votingButtons}
        {statements}
      </div>
    );
  }
}

export default Poll;
