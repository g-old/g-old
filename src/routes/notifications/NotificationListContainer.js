import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Box from '../../components/Box';
import Notification from '../../components/UserNotification';

import { getAllNotifications } from '../../reducers';

class NotificationsListContainer extends React.Component {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    notifications: null,
  };
  render() {
    return (
      <Box>
        <List>
          {this.props.notifications.map(n => (
            <ListItem>
              <Notification {...n} />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  notifications: getAllNotifications(state),
});

export default connect(mapStateToProps)(NotificationsListContainer);
