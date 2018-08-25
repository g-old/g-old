import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ActivityPanel.css';
import Box from '../Box';
import { genActivityPageKey } from '../../reducers/pageInfo';

import {
  getActivities,
  getResourcePageInfo,
  getVisibleUsers,
} from '../../reducers';
import { loadActivities } from '../../actions/activity';
import { findUser } from '../../actions/user';
import AssetsTable from '../AssetsTable';
import ActivityRow from './ActivityRow';
import Button from '../Button';
import ActivityLayer from '../ActivityLayer';
import ActivityFilter from '../ActivityFilter';

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
    fetchUser: PropTypes.func.isRequired,
    userData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      filter: {
        type: undefined,
        verb: undefined,
        actorId: undefined,
        objectId: undefined,
      },
    };
    this.fetchActivities = this.fetchActivities.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    this.fetchActivities();
  }

  onMenuClick(action, data) {
    this.setState({ currentActivity: data, showLayer: true });
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

  handleFilterChange(data) {
    this.setState(prevState => {
      if (prevState.filter[data.type]) {
        let toDelete;
        if (prevState.filter.objectId && data.type === 'type') {
          toDelete = true;
        }

        const { [data.type]: omit, ...filter } = prevState.filter;
        return {
          filter: {
            ...filter,
            ...(omit === data.value ? [] : { [data.type]: data.value }),
            ...(toDelete ? { objectId: undefined } : []),
          },
        };
      }
      return { filter: { ...prevState.filter, [data.type]: data.value } };
    }, this.fetchActivities);
  }

  toggleLayer() {
    this.setState(prevState => ({ showLayer: !prevState.showLayer }));
  }

  render() {
    const { activities = [], pageInfo, fetchUser, userData } = this.props;
    const { showLayer, currentActivity, filter } = this.state;
    return (
      <Box column>
        <ActivityFilter
          values={filter}
          onSelect={this.handleFilterChange}
          fetchUser={fetchUser}
          userData={userData}
        />
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
        {showLayer && (
          <ActivityLayer {...currentActivity} onClose={this.toggleLayer} />
        )}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  activities: getActivities(state, 'all').sort(
    (a, b) => Number(b.id) - Number(a.id),
  ),
  pageInfo: getResourcePageInfo(state, 'activities', genActivityPageKey()),
  userData: getVisibleUsers(state, 'all'),
});

const mapDispatch = {
  fetchActivities: loadActivities,
  fetchUser: findUser,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(ActivityPanel));
