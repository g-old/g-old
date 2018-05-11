import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NotificationMenu.css';
import { ICONS } from '../../constants';
import Drop from '../Drop';
import Notification from '../UserNotification';
import NotificationSkeleton from '../UserNotificationSkeleton';
import {
  getAllNotifications,
  getSessionUser,
  getNotificationsStatus,
} from '../../reducers';
import {
  loadNotificationList,
  clearNotifications,
} from '../../actions/notification';
import NotificationDrop from '../NotificationDrop/NotificationDrop';

class NotificationMenu extends React.Component {
  static propTypes = {
    loadNotificationList: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unreadNotifications: PropTypes.number,
    }),
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    clearNotifications: PropTypes.func.isRequired,
    status: PropTypes.shape({}).isRequired,
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
        align: { top: 'bottom', right: 'right' },
        context: this.context,
        responsive: false,
        className: s.drop,
        /* make the Drop exactly 400px wide (will still respect windowWidth) */
        minWidth: 400,
        maxWidth: 400,
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
    const { notifications, status, user } = this.props;
    if (status.pending && !notifications.length) {
      let n = 1;
      /* eslint-disable */
      const placeHolder = Array.apply(null, {
        length: 5,
      }).map(() => ({ id: n++ }));
      /* eslint-enable */
      return (
        <NotificationDrop
          notifications={placeHolder}
          unreadNotifications={user.unreadNotifications}
          showSpinner={false}
          notificationComponent={NotificationSkeleton}
          onMarkAsRead={this.onMarkAsRead}
        />
      );
    }

    return (
      <NotificationDrop
        notifications={notifications}
        unreadNotifications={user.unreadNotifications}
        showSpinner={status.pending}
        notificationComponent={Notification}
        onMarkAsRead={this.onMarkAsRead}
      />
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
  status: getNotificationsStatus(state),
});
const mapDispatch = {
  loadNotificationList,
  clearNotifications,
};

export default connect(mapPropsToState, mapDispatch)(
  withStyles(s)(NotificationMenu),
);
