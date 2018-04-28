import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NotificationMenu.css';
import Box from '../Box';
import { ICONS } from '../../constants';
import Button from '../Button';
import Drop from '../Drop';
import List from '../List';
import ListItem from '../ListItem';
import Notification from '../UserNotification';
import { getAllNotifications, getSessionUser } from '../../reducers';
import Link from '../Link';
import Label from '../Label';
import {
  loadNotificationList,
  clearNotifications,
} from '../../actions/notification';

const messages = defineMessages({
  markRead: {
    id: 'label.markRead',
    defaultMessage: 'Mark all as read',
    description: 'Label mark as read',
  },
});

class NotificationMenu extends React.Component {
  static propTypes = {
    loadNotificationList: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unreadNotifications: PropTypes.number,
    }),
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    clearNotifications: PropTypes.func.isRequired,
  };
  static defaultProps = {
    user: null,
    notifications: null,
  };
  constructor(props) {
    super(props);
    this.onOpenMenu = this.onOpenMenu.bind(this);
    this.onCloseMenu = this.onCloseMenu.bind(this);
    // this.onClickNotification = this.onClickNotification.bind(this);
    this.renderNotifications = this.renderNotifications.bind(this);
    this.onMarkAsRead = this.onMarkAsRead.bind(this);

    this.state = { dropActive: false };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  componentDidMount() {
    //
  }

  componentDidUpdate(prevProps, prevState) {
    const { dropActive } = this.state;

    if (!dropActive && prevState.dropActive) {
      document.removeEventListener('click', this.onCloseMenu);

      if (this.drop) {
        this.drop.remove();
        this.drop = undefined;
      }
    }

    if (dropActive && !prevState.dropActive) {
      document.addEventListener('click', this.onCloseMenu);
      const container = this.componentRef.parentNode;
      this.control = document.createElement('div');
      // createPortal(this.renderNotifications(), container);
      // container.insertBefore(this.control, sibling);
      this.drop = new Drop(container, this.renderNotifications(), {
        align: { top: 'bottom', left: 'left' },
        context: this.context,
        responsive: false,
        className: s.drop,
      });
    } else if (dropActive && prevState.dropActive) {
      this.drop.render(this.renderNotifications());
    }
  }

  componentWillUnmount() {
    if (this.drop) {
      this.drop.remove();
    }
  }

  onOpenMenu() {
    this.props.loadNotificationList({ first: 10, userId: this.props.user.id });
    this.setState({ dropActive: true });
  }

  onCloseMenu() {
    this.setState({ dropActive: false });
  }
  onMarkAsRead(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.clearNotifications();
  }

  toggleMenu() {
    // history.push('/notifications');

    const { dropActive } = this.state;
    if (dropActive) {
      this.onCloseMenu();
    } else {
      this.onOpenMenu();
    }
  }
  renderNotifications() {
    const { notifications, user: { unreadNotifications } } = this.props;
    let markReadBtn;
    if (unreadNotifications > 0) {
      markReadBtn = (
        <Button
          onClick={this.onMarkAsRead}
          label={<FormattedMessage {...messages.markRead} />}
          plain
        />
      );
    }
    return (
      <Box column fill>
        <Box between>
          <Label>Notifications</Label>
          {markReadBtn}
        </Box>
        <List>
          {notifications.map(n => (
            <ListItem>
              <Notification {...n} />
            </ListItem>
          ))}
        </List>
        {/* eslint-disable-next-line */}
        <Link to="/notifications">See all Notifications</Link>
      </Box>
    );
  }

  render() {
    if (!this.props.user) {
      return null;
    }
    let numUnread;
    if (this.props.user.unreadNotifications > 0) {
      numUnread = this.props.user.unreadNotifications;
    }
    return (
      // eslint-disable-next-line
      <div onClick={this.toggleMenu} ref={elm => (this.componentRef = elm)}>
        <div className={cn(s.notification, numUnread ? s.unread : null)}>
          <span>{numUnread && this.props.user.unreadNotifications}</span>
          <svg
            version="1.1"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
            role="img"
            aria-label="menu"
          >
            <path fill="none" strokeWidth="2" d={ICONS.bell} />
          </svg>
        </div>
      </div>
    );
  }
}
NotificationMenu.contextTypes = {
  intl: PropTypes.object,
  insertCss: PropTypes.func,
};
const mapPropsToState = state => ({
  notifications: getAllNotifications(state).slice(0, 10),
  user: getSessionUser(state),
});
const mapDispatch = {
  loadNotificationList,
  clearNotifications,
};

export default connect(mapPropsToState, mapDispatch)(
  withStyles(s)(NotificationMenu),
);
