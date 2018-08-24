import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ActivityPanel.css';
import Box from '../Box';
import { genActivityPageKey } from '../../reducers/pageInfo';

import { getActivities, getResourcePageInfo } from '../../reducers';
import { loadActivities } from '../../actions/activity';
import AssetsTable from '../AssetsTable';
import ActivityRow from './ActivityRow';
import Button from '../Button';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});

class ActivityPanel extends React.Component {
  static propTypes = {
    activities: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
    fetchActivities: PropTypes.func.isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { filter: {} };
    this.fetchActivities = this.fetchActivities.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  componentDidMount() {
    this.fetchActivities();
  }

  onMenuClick(activity) {
    alert('TO IMPLEMENT');
    this.setState({ currentActivity: activity, showLayer: true });
  }

  fetchActivities(after) {
    const { fetchActivities } = this.props;
    const { filter } = this.state;
    fetchActivities({ after, filter });
  }

  handleLoadMore() {
    const { pageInfo } = this.props;
    this.fetchActivities(pageInfo.pagination.endCursor);
  }

  render() {
    const { activities = [], pageInfo } = this.props;
    const { showLayer, currentActivity } = this.state;
    return (
      <Box column>
        <AssetsTable
          onClickMenu={this.onMenuClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={activities || []}
          row={ActivityRow}
          tableHeaders={['Actor', 'Resource', 'Action', 'Date']}
        />
        {pageInfo.pagination.hasNextPage && (
          <Button
            primary
            disabled={pageInfo.pending}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
        {showLayer && <div> {JSON.stringify(currentActivity)}</div>}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  activities: getActivities(state, 'all').sort(
    (a, b) => Number(b.id) - Number(a.id),
  ),
  pageInfo: getResourcePageInfo(state, 'activities', genActivityPageKey()),
});

const mapDispatch = {
  fetchActivities: loadActivities,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(ActivityPanel));
