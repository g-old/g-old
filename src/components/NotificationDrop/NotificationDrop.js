import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NotificationDrop.css';
import Box from '../Box';
import Button from '../Button';
import List from '../List';
import ListItem from '../ListItem';
// import Notification from '../UserNotification';
import Spinner from '../Spinner';
import Link from '../Link';

const messages = defineMessages({
  notifications: {
    id: 'label.notifications',
    defaultMessage: 'Notifications',
    description: 'Notifications label',
  },
  markRead: {
    id: 'label.markRead',
    defaultMessage: 'Mark all as read',
    description: 'Label mark as read',
  },
  notificationsLink: {
    id: 'label.notificationsLink',
    defaultMessage: 'See all notifications',
    description: 'Label notifications link',
  },
});

const NotificationDrop = ({
  notifications,
  unreadNotifications,
  showSpinner,
  notificationComponent,
  onMarkAsRead,
}) => {
  let markReadBtn;
  if (unreadNotifications > 0) {
    markReadBtn = (
      <Button
        onClick={onMarkAsRead}
        disabled={showSpinner}
        label={<FormattedMessage {...messages.markRead} />}
        plain
      />
    );
  }
  let spinner;
  if (showSpinner) {
    spinner = (
      <div className={s.center}>
        <Spinner />
      </div>
    );
  }
  const Component = notificationComponent;

  return (
    <Box column fill>
      <div>
        <div className={s.header}>
          {spinner}
          <FormattedMessage {...messages.notifications} />
          {markReadBtn}
        </div>
        <List>
          {notifications.map(n => (
            <ListItem className={s.listItem} key={n.id}>
              {<Component {...n} />}
            </ListItem>
          ))}
        </List>
      </div>
      <div style={{ marginBottom: '1.5em', textAlign: 'center' }}>
        {/* eslint-disable-next-line */}
        <Link to="/notifications">
          <FormattedMessage {...messages.notificationsLink} />
        </Link>
      </div>
    </Box>
  );
};

NotificationDrop.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  unreadNotifications: PropTypes.number,
  showSpinner: PropTypes.bool,
  notificationComponent: PropTypes.node.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
};
NotificationDrop.defaultProps = {
  notifications: null,
  unreadNotifications: null,
  showSpinner: null,
};

export default withStyles(s)(NotificationDrop);
