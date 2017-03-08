
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Statement from '../../components/Statement';
import s from './Proposal.css';

class Proposal extends React.Component {

  static propTypes ={
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      publishedAt: PropTypes.string,
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
          <div className={s.title}>
            {this.props.proposal.title}
          </div>
          <div className={s.date}>
            {this.props.proposal.publishedAt}
          </div>
          <div className={s.body}>
            {this.props.proposal.body}
          </div>
        </div>
        <div className={s.poll}> {/* This should be a list component */}
          {this.props.proposal.pollOne.statements.map(statement => (
            <Statement
              key={statement.id}
              data={statement}
              ownLike={this.props.proposal.pollOne.likedStatements
                .find(data => data.statementId === statement.id)}
              pollId={this.props.proposal.pollOne.id}
            />
            ))}
        </div>
      </div>
    );
  }

}


export default withStyles(s)(Proposal);
