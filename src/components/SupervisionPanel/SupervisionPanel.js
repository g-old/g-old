import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedDate } from 'react-intl';
import Statement from '../Statement';
import {
  loadFlaggedStatements,
  solveFlag,
  loadFlaggedStatementsConnection,
} from '../../actions/statement';
import { getFlagsPage, getVisibleFlags } from '../../reducers';
import Avatar from '../Avatar';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import FetchError from '../FetchError';

const PAGESIZE = 5;
const renderUserInfo = user => <div><Avatar user={user} /> {`${user.name} ${user.surname}`} </div>;
const renderMenu = (solveFn, id, statementId) => (
  <div style={{ border: '1px solid', textAlign: 'center' }}>
    <span>
      <button onClick={() => solveFn({ id, statementId, action: 'delete' })}>DELETE</button>
      <button onClick={() => solveFn({ id, statementId, action: 'reject' })}>REJECT</button>
    </span>
  </div>
);

const showStatus = (data, fetching, error, filter, retryFn) => {
  let status = null;
  if (fetching && !data.length) {
    status = <p>Loading...</p>;
  } else if (!fetching && !data.length && !error) {
    status = <p> No data available </p>;
  } else if (error) {
    status = <FetchError message={error} onRetry={() => retryFn(filter, PAGESIZE)} />;
  }
  return status;
};

const renderFlaggedStatement = (data, flagFn) => {
  if (!data) return null;
  return (
    <div style={{ backgroundColor: '#FFD602', marginBottom: '1em' }}>
      Flagged by: {renderUserInfo(data.flagger)}
      Flagged user: {renderUserInfo(data.flaggedUser)}
      Flagged at:
      <FormattedDate
        value={data.createdAt}
        day="numeric"
        month="numeric"
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
      {data.state === 'open' && renderMenu(flagFn, data.id, data.statementId)}
    </div>
  );
};

class SupervisionPanel extends React.Component {
  static propTypes = {
    openFlagsArray: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statement: PropTypes.shape({}),
      }),
    ),
    rejectedFlagsArray: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statement: PropTypes.shape({}),
      }),
    ),
    deletedStatementsArray: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        statement: PropTypes.shape({}),
      }),
    ),
    openFlagsPageInfo: PropTypes.shape({}).isRequired,
    deletedFlagsPageInfo: PropTypes.shape({}).isRequired,
    rejectedFlagsPageInfo: PropTypes.shape({}).isRequired,
    solveFlag: PropTypes.func.isRequired,
    loadFlaggedStatementsConnection: PropTypes.func.isRequired,
  };

  static defaultProps = {
    statement: {},
  };
  componentDidMount() {}
  render() {
    const {
      openFlagsArray,
      deletedStatementsArray,
      rejectedFlagsArray,
      openFlagsPageInfo,
      rejectedFlagsPageInfo,
      deletedFlagsPageInfo,
    } = this.props;

    return (
      <div>
        <h1> FLAGGED STATEMENTS </h1>
        <Accordion>
          <AccordionPanel
            heading="To decide"
            onActive={() => {
              this.props.loadFlaggedStatementsConnection(
                'open',
                PAGESIZE,
                openFlagsPageInfo.endCursor,
              );
            }}
          >
            {showStatus(
              openFlagsArray,
              openFlagsPageInfo.isFetching,
              openFlagsPageInfo.errorMessage,
              'open',
              this.props.loadFlaggedStatementsConnection,
            )}
            {openFlagsArray.map(s => (
              <div>
                {renderFlaggedStatement(s, this.props.solveFlag)}
              </div>
            ))}
            {openFlagsPageInfo.hasNextPage &&
              <button
                disabled={openFlagsPageInfo.isFetching}
                onClick={() =>
                  this.props.loadFlaggedStatementsConnection(
                    'open',
                    PAGESIZE,
                    openFlagsPageInfo.endCursor,
                  )}
              >
                LOAD MORE
              </button>}
          </AccordionPanel>
          <AccordionPanel
            heading="Rejected flags"
            onActive={() => {
              this.props.loadFlaggedStatementsConnection(
                'rejected',
                PAGESIZE,
                rejectedFlagsPageInfo.endCursor,
              );
            }}
          >
            {showStatus(
              rejectedFlagsArray,
              rejectedFlagsPageInfo.isFetching,
              rejectedFlagsPageInfo.errorMessage,
              'rejected',
              this.props.loadFlaggedStatementsConnection,
            )}

            {rejectedFlagsArray.map(s => (
              <div>
                {renderFlaggedStatement(s, this.props.solveFlag)}
              </div>
            ))}
            {rejectedFlagsPageInfo.hasNextPage &&
              <button
                disabled={rejectedFlagsPageInfo.isFetching}
                onClick={() =>
                  this.props.loadFlaggedStatementsConnection(
                    'rejected',
                    PAGESIZE,
                    rejectedFlagsPageInfo.endCursor,
                  )}
              >
                LOAD MORE
              </button>}
          </AccordionPanel>
          <AccordionPanel
            heading="Deleted statements"
            onActive={() => {
              this.props.loadFlaggedStatementsConnection(
                'deleted',
                PAGESIZE,
                deletedFlagsPageInfo.endCursor,
              );
            }}
          >
            {showStatus(
              deletedStatementsArray,
              deletedFlagsPageInfo.isFetching,
              deletedFlagsPageInfo.errorMessage,
              'deleted',
              this.props.loadFlaggedStatementsConnection,
            )}

            {deletedStatementsArray.map(s => (
              <div>
                {renderFlaggedStatement(s, this.props.solveFlag)}
              </div>
            ))}
            {deletedFlagsPageInfo.hasNextPage &&
              <button
                disabled={deletedFlagsPageInfo.isFetching}
                onClick={() =>
                  this.props.loadFlaggedStatementsConnection(
                    'deleted',
                    PAGESIZE,
                    deletedFlagsPageInfo.endCursor,
                  )}
              >
                LOAD MORE
              </button>}
          </AccordionPanel>

        </Accordion>

      </div>
    );
  }
}
const mapStateToProps = state => ({
  openFlagsArray: getVisibleFlags(state, 'open'),
  deletedStatementsArray: getVisibleFlags(state, 'deleted'),
  rejectedFlagsArray: getVisibleFlags(state, 'rejected'),
  openFlagsPageInfo: getFlagsPage(state, 'open'),
  rejectedFlagsPageInfo: getFlagsPage(state, 'rejected'),
  deletedFlagsPageInfo: getFlagsPage(state, 'deleted'),
});
const mapDispatch = { loadFlaggedStatements, solveFlag, loadFlaggedStatementsConnection };
export default connect(mapStateToProps, mapDispatch)(SupervisionPanel);
