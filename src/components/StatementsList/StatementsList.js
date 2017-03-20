import React, { PropTypes } from 'react';
import Statement from '../Statement';
import StatementInput from '../StatementInput';

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
  };
  constructor(props) {
    super(props);
    this.state = { showOwnStatement: true };
    this.toggleStatement = this.toggleStatement.bind(this);
  }
  toggleStatement() {
    this.setState({ ...this.state, showOwnStatement: !this.state.showOwnStatement });
  }
  render() {
    // show input only if then user has voted and hasnt written a statement
    let input = 'VOTE, THEN DEBATE ;) ';

    if (this.props.voted) {
      if (!this.state.showOwnStatement) {
        input = (
          <StatementInput
            onSubmit={this.props.onSubmit}
            title={this.props.ownStatement.title}
            text={this.props.ownStatement.text}
            statementId={this.props.ownStatement.id}
            showOwnStatement={this.toggleStatement}
          />
        );
      } else {
        input = <StatementInput onSubmit={this.props.onSubmit} />;
      }
    }
    let ownStatement = null;
    if (this.props.ownStatement && this.state.showOwnStatement) {
      ownStatement = (
        <Statement
          key={this.props.ownStatement.id}
          data={this.props.ownStatement}
          ownLike={this.props.likedStatements.find(
            data => data.statementId === this.props.ownStatement.id,
          )}
          pollId={this.props.pollId}
          ownStatement
          hideStatement={this.toggleStatement}
        />
      );

      // dont show input
      input = 'EVERYTHING ALREADY SAID';
    }

    return (
      <div>
        {input}

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
              />
              : null,
        )}
        {/* eslint-enable no-confusing-arrow */}
      </div>
    );
  }
}

export default StatementsList;
