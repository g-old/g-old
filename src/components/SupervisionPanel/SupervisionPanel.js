import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Statement from '../Statement';
import { loadFlaggedStatements, solveFlag } from '../../actions/statement';
import { getFlaggedStatements } from '../../reducers';
import Avatar from '../Avatar';

const renderUserInfo = user => <div><Avatar user={user} /> {`${user.name} ${user.surname}`} </div>;
const renderMenu = (solveFn, id, statementId) => (
  <div style={{ border: '1px solid', textAlign: 'center' }}>
    <span>
      <button onClick={() => solveFn({ id, statementId, action: 'delete' })}>DELETE</button>
      <button onClick={() => solveFn({ id, statementId, action: 'reject' })}>REJECT</button>
    </span>
  </div>
);
const renderFlaggedStatement = (data, flagFn) => (
  <div style={{ backgroundColor: 'yellow', marginBottom: '1em' }}>
    Flagged by: {renderUserInfo(data.flagger)}
    Flagged user: {renderUserInfo(data.flaggedUser)}
    Flagged at: {data.createdAt} <br />
    Flag count: {data.count} <br />
    State: {data.state} <br />
    Flagged content: <p>{data.content}</p>
    Actual Statement: <Statement data={data.statement} />
    Solved by: {data.solver && renderUserInfo(data.solver)}<br />
    {renderMenu(flagFn, data.id, data.statement.id)}
  </div>
);

class SupervisionPanel extends React.Component {
  static propTypes = {
    flaggedStatements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ),
    loadFlaggedStatements: PropTypes.func.isRequired,
    solveFlag: PropTypes.func.isRequired,
  };
  componentDidMount() {
    this.props.loadFlaggedStatements();
  }
  render() {
    const { flaggedStatements } = this.props;
    return (
      <div>
        {' '}<h1>FLAGGED IMAGES</h1>

        <h1> FLAGGED STATEMENTS </h1>
        {flaggedStatements &&
          flaggedStatements.map(s => (
            <div>
              {renderFlaggedStatement(s, this.props.solveFlag)}
            </div>
          ))}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  flaggedStatements: getFlaggedStatements(state),
});
const mapDispatch = { loadFlaggedStatements, solveFlag };
export default connect(mapStateToProps, mapDispatch)(SupervisionPanel);
