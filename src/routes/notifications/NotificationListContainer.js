import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Heading from '../../components/Heading';
import Select from '../../components/Select';
import Button from '../../components/Button';

import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Box from '../../components/Box';
import Notification from '../../components/UserNotification';
import { loadNotificationList } from '../../actions/notification';
import { getAllNotifications, getNotificationsStatus } from '../../reducers';
import NotificationSkeleton from '../../components/UserNotificationSkeleton';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
  notifications: {
    id: 'label.notifications',
    defaultMessage: 'Notifications',
    description: 'Notifications label',
  },
});
class NotificationsListContainer extends React.Component {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    loadNotificationList: PropTypes.func.isRequired,
    notificationsStatus: PropTypes.shape({}),
    user: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    notifications: null,
    notificationsStatus: null,
  };
  constructor(props) {
    super(props);
    this.state = { filter: [], filterDirty: false };
    this.loadNotifications = this.loadNotifications.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
  }

  loadNotifications(event, after) {
    const { user, notificationsStatus } = this.props;
    if (!notificationsStatus.pending) {
      this.props.loadNotificationList(
        {
          after,
          userId: user.id,
          filterBy: this.state.filter.map(f => f.value),
        },
        this.state.filterDirty,
      );

      if (!after) {
        this.setState({ filterDirty: false });
      }
    }
  }

  resetFilter() {
    this.setState({ filterDirty: true, filter: [] }, this.loadNotifications);
  }
  render() {
    const { notificationsStatus } = this.props;
    const active = this.state.filter.length > 0;
    let notificationList;
    if (notificationsStatus.pending && !this.props.notifications.length) {
      let n = 1;
      // eslint-disable-next-line
      const placeHolder = Array.apply(null, {
        length: 10,
        // eslint-disable-next-line
      }).map(() => ({
        id: (n += 1),
      }));
      notificationList = (
        <List>
          {placeHolder.map(() => (
            <ListItem>
              <NotificationSkeleton />
            </ListItem>
          ))}
        </List>
      );
    } else {
      notificationList = (
        <List>
          {this.props.notifications.map(n => (
            <ListItem>
              <Notification {...n} />
            </ListItem>
          ))}
        </List>
      );
    }

    return (
      <Box tag="article" pad column>
        <Heading tag="h2">
          <FormattedMessage {...messages.notifications} />
        </Heading>
        <Box>
          <Button
            disabled={!active || notificationsStatus.pending}
            onClick={this.resetFilter}
            plain
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <polygon
                  fill={active ? '#eee7f5' : 'none'}
                  opacity={active ? 1 : 0.2}
                  stroke="#000"
                  strokeWidth="2"
                  points="3 6 10 13 10 21 14 21 14 13 21 6 21 3 3 3"
                />
              </svg>
            }
          />{' '}
          <Select
            multiple
            value={this.state.filter.length ? this.state.filter : ''}
            onChange={e =>
              this.state.filter.find(f => f.value === e.option.value)
                ? this.setState(
                    {
                      filterDirty: true,
                      filter: this.state.filter.filter(
                        f => f.value !== e.option.value,
                      ),
                    },
                    this.loadNotifications,
                  )
                : this.setState(
                    {
                      filterDirty: true,
                      filter: [...this.state.filter, e.option],
                    },
                    this.loadNotifications,
                  )
            }
            options={[
              { label: 'read', value: 'READ' },
              { label: 'unread', value: 'UNREAD' },
              { label: 'proposal', value: 'PROPOSAL' },
              { label: 'comment', value: 'COMMENT' },
              { label: 'message', value: 'MESSAGE' },
              { label: 'discussion', value: 'DISCUSSION' },
              { label: 'statement', value: 'STATEMENT' },
            ]}
          />
        </Box>
        {notificationList}
        {notificationsStatus.pageInfo.hasNextPage && (
          <Button
            primary
            disabled={notificationsStatus.pending}
            onClick={e =>
              this.loadNotifications(e, notificationsStatus.pageInfo.endCursor)
            }
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  notifications: getAllNotifications(state).sort(
    (a, b) => new Date(b.activity.createdAt) - new Date(a.activity.createdAt),
  ),
  notificationsStatus: getNotificationsStatus(state, 'all'),
});

const mapDispatch = {
  loadNotificationList,
};

export default connect(mapStateToProps, mapDispatch)(
  NotificationsListContainer,
);
