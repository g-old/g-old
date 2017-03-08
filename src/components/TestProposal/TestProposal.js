
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Statement from '../../components/Statement';
import s from './TestProposal.css';

class TestProposal extends React.Component {

  static propTypes ={
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      pollOne: PropTypes.shape({
        statements: PropTypes.arrayOf(PropTypes.object),
        id: PropTypes.string,
        likedStatements: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        })),
      }),
    }),

  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div>
            {this.props.proposal.title}
          </div>
          <div>
            {this.props.proposal.body}
          </div>
          <div className={s.container}> {/* This should be a list component */}
            {this.props.proposal.pollOne.statements.map(statement => (
              <Statement
                key={statement.id}
                data={statement}
                ownLike={this.props.proposal.pollOne.likedStatements
                  .find(data => data.statementId === statement.id)}
                pollId={this.props.proposal.pollOne.id}
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


export default withStyles(s)(TestProposal);
