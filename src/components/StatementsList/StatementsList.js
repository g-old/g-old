import React from 'react';
import PropTypes from 'prop-types';
import Statement from '../Statement';

class StatementsList extends React.Component {
  static propTypes = {
    statements: PropTypes.arrayOf(PropTypes.object).isRequired,
    likedStatements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statementId: PropTypes.string,
      }),
    ).isRequired,
    pollId: PropTypes.string.isRequired,
    user: PropTypes.shape({ id: PropTypes.string }).isRequired,
    voted: PropTypes.bool.isRequired,
    ownStatement: PropTypes.shape({ id: PropTypes.string }),
    onSubmit: PropTypes.func.isRequired,
    ownVote: PropTypes.shape({
      id: PropTypes.string,
    }),
    followees: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ).isRequired,
  };

  static defaultProps = {
    ownVote: null,
    ownStatement: null,
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
        {this.props.statements &&
          this.props.statements.map(
            statement =>
              // eslint-disable-next-line eqeqeq
              (this.props.user.id != statement.author.id // to eliminate ownstatement from rendering
                ? <Statement
                  key={statement.id}
                  data={statement}
                  ownLike={this.props.likedStatements.find(
                      data => data.statementId === statement.id,
                    )}
                  pollId={this.props.pollId}
                  ownStatement={false}
                  onSubmit={this.props.onSubmit}
                  isFollowee={
                      this.props.followees.find(f => f.voter.id === statement.author.id) != null
                    }
                />
                : null),
          )}
        {/* eslint-enable no-confusing-arrow */}
      </div>
    );
  }
}

export default StatementsList;
