import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import { loadStatistics } from '../../actions/statistics';
import { getStatistics } from '../../reducers';
import s from './TechPanel.css';

const renderTables = tables =>
  <table className={s.tables}>
    <thead>
      <tr>
        <th>
          {'Tablename'}
        </th>
        <th>
          {'Index usage'}
        </th>
        <th>
          {'Rows'}
        </th>
      </tr>
    </thead>
    <tbody>
      {tables &&
        tables.map(t =>
          <tr>
            <td>
              {t.table}
            </td>
            <td>
              {t.indexUsage}
            </td>
            <td>
              {t.numRows}
            </td>
          </tr>,
        )}
    </tbody>
  </table>;

const renderStatus = data =>
  <div className={s.status}>
    <span>{`Actual: ${data.usage}`}</span>
    <span>{`Limit: ${data.limit}`}</span>
    <span>{`Used: ${data.usedPercent} %`}</span>
  </div>;
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
          <span>
            {`Size: ${size}`}
          </span>
          <span>
            {`Cache Hit Rate: ${cacheHitRate}`}
          </span>
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
          <span>
            {`CPUs: ${numCpus}`}
          </span>
          <span>
            {`Uptime: ${uptime / 3600} h`}
          </span>
          <span>
            {`Memory: ${Number(memory[1]) / 1024} FREE ${Number(memory[0]) /
              1024} TOTAL`}
          </span>
          <span>
            {`Load Average: Last 5 min: ${loadAvg[0]}   Last 15 min: ${loadAvg[1]} Last hour: ${loadAvg[2]} `}
          </span>
        </div>
      );
    }

    return (
      <div>
        <div>
          <h3>
            {'Usage'}
          </h3>
          {statistics.usersOnline &&
            `User online in the last 24h: ${statistics.usersOnline}`}
        </div>
        <div>
          <h3>
            {'Server'}
          </h3>
          {serverInfo}
        </div>
        <div>
          <h3>
            {'Online Hosting (Imagestore - Cloudinary)'}
          </h3>
          {bucketInfo}
        </div>
        <div>
          <h3>
            {'Database'}
          </h3>
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
export default connect(mapStateToProps, mapDispatch)(withStyles(s)(TechPanel));
