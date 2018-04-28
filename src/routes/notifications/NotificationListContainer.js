import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Heading from '../../components/Heading';

import Button from '../../components/Button';

import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Box from '../../components/Box';
import Notification from '../../components/UserNotification';
import { loadNotificationList } from '../../actions/notification';
import { getAllNotifications, getNotificationsStatus } from '../../reducers';

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
  render() {
    const { notificationsStatus, user } = this.props;
    return (
      <Box tag="article" pad column>
        <Heading tag="h2">
          <FormattedMessage {...messages.notifications} />
        </Heading>
        <List>
          {this.props.notifications.map(n => (
            <ListItem>
              <Notification {...n} />
            </ListItem>
          ))}
        </List>
        {notificationsStatus.pageInfo.hasNextPage && (
          <Button
            primary
            disabled={notificationsStatus.pending}
            onClick={() => {
              this.props.loadNotificationList({
                after: notificationsStatus.pageInfo.endCursor,
                union: true,
                userId: user.id,
              });
            }}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  notifications: getAllNotifications(state).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  ),
  notificationsStatus: getNotificationsStatus(state, 'all'),
});

const mapDispatch = {
  loadNotificationList,
};

export default connect(mapStateToProps, mapDispatch)(
  NotificationsListContainer,
);
