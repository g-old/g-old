import React, { PropTypes } from 'react';
import Statement from '../Statement';

class StatementsList extends React.Component {
  static propTypes = {
    statements: PropTypes.arrayOf(PropTypes.object),
    likedStatements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statementId: PropTypes.string,
      }),
    ),
    pollId: PropTypes.string,
    user: PropTypes.object.isRequired,
    voted: PropTypes.bool.isRequired,
    ownStatement: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    ownVote: PropTypes.object,
  };

  render() {
    // show input only if then user has voted and hasnt written a statement
    let input = 'VOTE, THEN DEBATE ;) ';
    let ownStatement = null;
    if (this.props.voted) {
      input = null;
    }
    if (!this.props.ownStatement && this.props.voted) {
      const data = {
        vote: this.props.ownVote,
        author: this.props.user,
        pollId: this.props.pollId,
        likes: 0,
        text: '',
      };
      ownStatement = (
        <Statement data={data} onSubmit={this.props.onSubmit} pollId={this.props.pollId} asInput />
      );
    }

    if (this.props.ownStatement) {
      ownStatement = (
        <Statement
          onSubmit={this.props.onSubmit}
          key={this.props.ownStatement.id}
          data={this.props.ownStatement}
          ownLike={this.props.likedStatements.find(
            data => data.statementId === this.props.ownStatement.id,
          )}
          pollId={this.props.pollId}
          ownStatement
        />
      );

      // dont show input
      input = 'EVERYTHING ALREADY SAID';
    }

    return (
      <div>
        {input}
        {}
        {ownStatement}
        {/* eslint-disable no-confusing-arrow */}
        {this.props.statements.map(
          statement =>
          // eslint-disable-next-line eqeqeq
            this.props.user.id != statement.author.id // to eliminate ownstatement from rendering
              ? <Statement
                key={statement.id}
                data={statement}
                ownLike={this.props.likedStatements.find(
                    data => data.statementId === statement.id,
                  )}
                pollId={this.props.pollId}
                ownStatement={false}
                onSubmit={this.props.onSubmit}
              />
              : null,
        )}
        {/* eslint-enable no-confusing-arrow */}
      </div>
    );
  }
}

export default StatementsList;
