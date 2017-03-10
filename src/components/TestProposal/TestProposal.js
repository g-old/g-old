
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Statement from '../../components/Statement';
import s from './TestProposal.css';
import StatementInput from '../StatementInput';
import { createStatement, updateStatement } from '../../actions/statement';
import { createVote, updateVote, deleteVote } from '../../actions/vote';


class TestProposal extends React.Component {

  static propTypes ={
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      votes: PropTypes.number,
      pollOne: PropTypes.shape({
        statements: PropTypes.arrayOf(PropTypes.object),
        upvotes: PropTypes.number,
        downvotes: PropTypes.number,
        ownVote: PropTypes.shape({
          id: PropTypes.string,
          position: PropTypes.string,
        }),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        })),
      }),
    }),
    user: PropTypes.object.isRequired,
    hasWrittenStatement: PropTypes.func,
    createStatement: PropTypes.func.isRequired,
    updateStatement: PropTypes.func.isRequired,
    createVote: PropTypes.func.isRequired,
    updateVote: PropTypes.func.isRequired,
    deleteVote: PropTypes.func.isRequired,
  }

  handleOnSubmit(data, pollId) {
    // TODO check for vote

    let vote = this.props.proposal.pollOne.ownVote;
    if (!vote) {
      vote = { position: 'pro', pollId };
    }
    if (!this.props.proposal.pollOne.ownVote) {
      this.props.createStatement({ ...data, vote, pollId });
    }
  }

  handleVote(position) {
    const data = {
      position,
      pollId: this.props.proposal.pollOne.id,
    };
    if (!this.props.proposal.pollOne.ownVote) {
      this.props.createVote(data);
    } else if (this.props.proposal.pollOne.ownVote.position === position) {
      this.props.deleteVote({ ...data, id: this.props.proposal.pollOne.ownVote.id });
    } else {
      this.props.updateVote({ ...data, id: this.props.proposal.pollOne.ownVote.id });
    }
  }
  /* eslint-disable no-nested-ternary */
  render() {
    console.log('RENDERTESTPROP');
    console.log(this.props);
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div>
            {this.props.proposal.title}
          </div>
          <div>
            {this.props.proposal.body}
          </div>
          <div>
            <br />
            {this.props.proposal.votes}
          </div>
          <div>
            {this.props.proposal.pollOne.ownVote ? 'VOTED' : 'NOTVOTED'}
            <br />
            <button
              onClick={() => this.handleVote('pro')}
              style={{ background: this.props.proposal.pollOne.ownVote ? (this.props.proposal.pollOne.ownVote.position === 'pro' ? 'red' : '') : '' }}
            >
              VOTE YES
            </button>
            <br />
            <button
              onClick={() => this.handleVote('con')}
              style={{ background: this.props.proposal.pollOne.ownVote ? (this.props.proposal.pollOne.ownVote.position === 'con' ? 'red' : '') : '' }}
            >
              VOTE NO
            </button>
          </div>
          <button onClick={() => alert('clicked')}> ADD STATEMENT </button>
          <div className={s.container}> {/* This should be a list component */}
            {this.props.hasWrittenStatement ? <StatementInput
              isVisible
              onSubmit={(data) => this.handleOnSubmit(data, this.props.proposal.pollOne.id)}
            /> : 'NO STATEMENTS WRITTEN'}
            <br />
            {`UPVOTES: ${this.props.proposal.pollOne.upvotes}` }
            <br />
            {`DOWNVOTES: ${this.props.proposal.pollOne.downvotes}` }
            {this.props.proposal.pollOne.statements.map(statement => (
              <Statement
                key={statement.id}
                data={statement}
                ownLike={this.props.proposal.pollOne.likedStatements
                  .find(data => data.statementId === statement.id)}
                pollId={this.props.proposal.pollOne.id}
                ownStatement={this.props.user.id === statement.author.id}
              />

              ))}
            { /* title={statement.title}
                text={statement.text}
                position={statement.vote.position}
                likes={statement.likes}
                likeFn={this.props.likeFn} */}
          </div>
        </div>
      </div>
    );
  }

}

const mapDispatch = {
  createStatement,
  updateStatement,
  createVote,
  updateVote,
  deleteVote,
};

export default connect(null, mapDispatch)(withStyles(s)(TestProposal));
