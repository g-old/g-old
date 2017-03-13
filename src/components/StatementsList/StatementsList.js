import React, { PropTypes } from 'react';
import Statement from '../Statement';
import StatementInput from '../StatementInput';

class StatementsList extends React.Component {
  static propTypes = {
    statements: PropTypes.object,
    likedStatements: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      statementId: PropTypes.string,
    })),
    pollId: PropTypes.string,
    user: PropTypes.object.isRequired,
    voted: PropTypes.bool.isRequired,
    ownStatement: PropTypes.bool,
  }
  render() {
      // show input only if then user has voted and hasnt written a statement
    let input = 'VOTE, THEN DEBATE ;) ';
    if (this.props.voted) {
      input = <StatementInput onSubmit={() => alert('SUBMITTING')} />;
    }
    let ownStatement = null;
    if (this.props.ownStatement) {
      ownStatement = (<Statement
        key={this.props.ownStatement.id}
        data={this.props.ownStatement}
        ownLike={this.props.likedStatements
            .find(data => data.statementId === this.props.ownStatement.id)}
        pollId={this.props.pollId}
        ownStatement
      />);

        // dont show input
      input = 'EVERYTHING ALREADY SAID';
    }
    return (
      <div>
        {input}

        {ownStatement}

        {this.props.statements.map(statement => (
          // eslint-disable-next-line eqeqeq
          this.props.user.id != statement.author.id ?  // to eliminate ownstatement from rendering
            <Statement
              key={statement.id}
              data={statement}
              ownLike={this.props.likedStatements
              .find(data => data.statementId === statement.id)}
              pollId={this.props.pollId}
              ownStatement={this.props.user.id === statement.author.id}
            /> : null
          ))}
      </div>
    );
  }
}

export default StatementsList;
