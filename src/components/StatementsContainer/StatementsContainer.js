import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Statement from '../Statement';
import {
  deleteStatement,
  flag,
  solveFlag,
  createStatement,
  updateStatement,
} from '../../actions/statement';
import { createLike, deleteLike } from '../../actions/statement_like';
import { updateUser } from '../../actions/user';
import { getStatementUpdates, getVisibibleStatementsByPoll } from '../../reducers';

class StatementsContainer extends React.Component {
  static propTypes = {
    statements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
        pollId: PropTypes.string,
      }),
    ),
    poll: PropTypes.shape({
      likedStatements: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          statementId: PropTypes.string,
        }),
      ),
      ownStatement: PropTypes.shape({ id: PropTypes.string }),
      ownVote: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,

    user: PropTypes.shape({ id: PropTypes.string }).isRequired,

    followees: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ).isRequired,
    updates: PropTypes.shape({}).isRequired,
    hideOwnStatement: PropTypes.bool,
    updateStatement: PropTypes.func.isRequired,
    createStatement: PropTypes.func.isRequired,
    deleteStatement: PropTypes.func.isRequired,
    solveFlag: PropTypes.func.isRequired,
    flag: PropTypes.func.isRequired,
    createLike: PropTypes.func.isRequired,
    deleteLike: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
  };

  static defaultProps = {
    statements: [],
    ownVote: null,
    ownStatement: null,
    likedStatements: [],
    hideOwnStatement: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.handleStatementSubmission = this.handleStatementSubmission.bind(this);
  }
  handleStatementSubmission({ id, text }, update) {
    if (update) {
      this.props.updateStatement({ id, text });
    }
  }
  render() {
    const {
      poll: { ownStatement, ownVote, id, likedStatements, mode },
      user,
      hideOwnStatement,
      followees,
      updates,
      statements,
    } = this.props;
    let ownStatementsNode = null;
    let statementsList = [];

    if (mode.withStatements) {
      if (!ownStatement && ownVote) {
        const data = {
          vote: ownVote,
          author: user,
          pollId: id,
          likes: 0,
          text: '',
        };
        ownStatementsNode = (
          <Statement
            user={user}
            key={'0000'}
            updates={updates['0000']}
            {...data}
            onCreate={this.props.createStatement}
            asInput
            followees={followees}
          />
        );
      }
      if (ownStatement && !hideOwnStatement) {
        ownStatementsNode = (
          <Statement
            user={user}
            onSubmit={this.handleStatementSubmission}
            key={ownStatement.id}
            {...ownStatement}
            updates={updates[ownStatement.id]}
            ownStatement
            followees={followees}
            onUpdate={this.props.updateStatement}
            onCreate={this.props.createStatement}
            onDelete={this.props.deleteStatement}
          />
        );
      }
      // eslint-disable-next-line eqeqeq
      statementsList = statements.filter(s => s.author.id != user.id);
    }
    return (
      <div>
        {ownStatementsNode}
        {statementsList.map(s =>
          (<Statement
            {...s}
            user={user}
            key={s.id}
            ownLike={likedStatements && likedStatements.find(data => data.statementId === s.id)}
            onLike={this.props.createLike}
            onDeleteLike={this.props.deleteLike}
            onFollow={this.props.updateUser}
            onDelete={this.props.deleteStatement}
            onModeration={this.props.solveFlag}
            onFlagging={this.props.flag}
            followees={followees}
            isFollowee={followees.some(f => f.id === s.author.id)}
          />),
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, { poll: { id }, filter }) => {
  const statements = getVisibibleStatementsByPoll(state, id, filter);
  if (statements) {
    statements.sort((a, b) => b.likes - a.likes);
  }
  return {
    statements,
    updates: getStatementUpdates(state),
  };
};
const mapDispatch = {
  deleteStatement,
  flag,
  solveFlag,
  createStatement,
  updateStatement,
  createLike,
  deleteLike,
  updateUser,
};

export default connect(mapStateToProps, mapDispatch)(StatementsContainer);
