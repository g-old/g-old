import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';

import { loadStatistics } from '../../actions/statistics';
import { getStatistics } from '../../reducers';
import s from './TechPanel.css';

const renderStats = stats => (
  <table className={s.tables}>
    <thead>
      <tr>
        <th>Resource</th>
        <th>Average time</th>
        <th>Median time</th>
        <th>Requests</th>
      </tr>
    </thead>
    <tbody>
      {stats &&
        stats.map(t => (
          <tr key={t.id}>
            <td>{t.resource}</td>
            <td>{`${Math.round(t.avgTime * 10) / 10} ms`}</td>
            <td>{`${Math.round(t.medianTime * 10) / 10} ms`}</td>
            <td>{t.numRequests}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const renderTables = tables => (
  <table className={s.tables}>
    <thead>
      <tr>
        <th>Tablename</th>
        <th>Index usage</th>
        <th>Rows</th>
      </tr>
    </thead>
    <tbody>
      {tables &&
        tables.map(t => (
          <tr key={t.id}>
            <td>{t.table}</td>
            <td>{t.indexUsage}</td>
            <td>{t.numRows}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const renderStatus = data =>
  data && (
    <div className={s.status}>
      <span>{`Actual: ${data.usage}`}</span>
      <span>{`Limit: ${data.limit}`}</span>
      <span>{`Used: ${data.usedPercent} %`}</span>
    </div>
  );
class TechPanel extends React.Component {
  static propTypes = {
    loadStatistics: PropTypes.func.isRequired,
    statistics: PropTypes.shape({}).isRequired,
  };

  componentDidMount() {
    this.props.loadStatistics();
  }

  render() {
    const { statistics } = this.props;
    let bucketInfo;
    if (statistics.bucket) {
      const { bandwidth, objects, storage, requests } = statistics.bucket;
      bucketInfo = (
        <div>
          {'Bandwidth'}
          {renderStatus(bandwidth)}
          {'Objects'}
          {renderStatus(objects)}
          {'Storage'}
          {renderStatus(storage)}
          {`Requests: ${requests}`}
        </div>
      );
    }
    let dbInfo;
    if (statistics.db) {
      const { size, cacheHitRate, indexUsage } = statistics.db;
      dbInfo = (
        <div className={s.db}>
          <span>{`Size: ${size}`}</span>
          {cacheHitRate && (
            <span>{`Cache Hit Rate: ${cacheHitRate.toFixed(2)}`}</span>
          )}
          {'Index Usage'}
          {renderTables(indexUsage)}
        </div>
      );
    }
    let serverInfo;

    if (statistics.server) {
      const { numCpus, loadAvg, uptime, memory } = statistics.server;

      serverInfo = (
        <div className={s.db}>
          <span>{`CPUs: ${numCpus}`}</span>
          <span>{`Uptime: ${Math.round((uptime / 3600) * 10) / 10} h`}</span>
          <span>
            {`Memory: ${Number(memory[1]) / 1024} FREE ${Number(memory[0]) /
              1024} TOTAL`}
          </span>
          <span>
            {`Load Average: Last 5 min: ${Math.round(loadAvg[0] * 10) /
              10}   Last 15 min: ${Math.round(loadAvg[1] * 10) /
              10} Last hour: ${Math.round(loadAvg[2]) / 10} `}
          </span>
        </div>
      );
    }

    let performanceInfo;
    if (statistics.performance) {
      const sse = statistics.performance.filter(stats => stats.type === 'SSE');
      const queries = statistics.performance.filter(
        stats => stats.type === 'query',
      );
      const mutations = statistics.performance.filter(
        stats => stats.type === 'mutation',
      );
      const assets = statistics.performance.filter(
        stats => stats.type === 'asset',
      );
      const graphql = statistics.performance.filter(
        stats => stats.type === 'gQL',
      );
      const numReqs = statistics.performance.reduce(
        // eslint-disable-next-line
        (acc, curr) => (acc += curr.numRequests),
        0,
      );
      performanceInfo = (
        <div>
          {`Total requests: ${numReqs}`}
          <h4>Server Side Rendering</h4>
          {renderStats(sse)}
          <h4>GraphQL Queries</h4>
          {renderStats(graphql)}
          <h4>Express Queries / Mutations</h4>
          {renderStats(queries)}
          <h4>Mutations</h4>
          {renderStats(mutations)}
          <h4>Assets</h4>
          {renderStats(assets)}
        </div>
      );
    }

    return (
      <div>
        <div>
          <h3>Usage</h3>
          {statistics.usersOnline &&
            `User online in the last 24h: ${statistics.usersOnline}`}
        </div>
        <div>
          <h3>Performance Data - over last 24h</h3>
          {performanceInfo}
        </div>
        <div>
          <h3>Server</h3>
          {serverInfo}
        </div>
        <div>
          <h3>Online Hosting (Imagestore - Cloudinary)</h3>
          {bucketInfo}
        </div>
        <div>
          <h3>Database</h3>
          {dbInfo}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({ statistics: getStatistics(state) });
const mapDispatch = {
  loadStatistics,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(TechPanel));
