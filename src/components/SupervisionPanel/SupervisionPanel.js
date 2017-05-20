import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedDate } from 'react-intl';
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
  <div style={{ backgroundColor: '#FFD602', marginBottom: '1em' }}>
    Flagged by: {renderUserInfo(data.flagger)}
    Flagged user: {renderUserInfo(data.flaggedUser)}
    Flagged at:
    <FormattedDate
      value={data.createdAt}
      weekday="long"
      day="numeric"
      month="long"
      year="numeric"
      hour="numeric"
      minute="numeric"
      second="numeric"
    />

    <br />
    Flag count: {data.count} <br />
    State: {data.state} <br />
    Flagged content: <p>{data.content}</p>
    Actual Statement:
    {' '}
    {data.statement ? <Statement data={data.statement} /> : <p>DELETED BY USER</p>}
    Solved by: {data.solver && renderUserInfo(data.solver)}<br />
    {renderMenu(flagFn, data.id, data.statementId)}
  </div>
);

class SupervisionPanel extends React.Component {
  static propTypes = {
    flaggedStatements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statement: PropTypes.shape({}),
      }),
    ),
    loadFlaggedStatements: PropTypes.func.isRequired,
    solveFlag: PropTypes.func.isRequired,
  };

  static defaultProps = {
    statement: {},
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
