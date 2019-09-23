import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import StyleContext from 'isomorphic-style-loader/StyleContext';
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
  constructor(props) {
    super(props);
    this.onOpenMenu = this.onOpenMenu.bind(this);
    this.onCloseMenu = this.onCloseMenu.bind(this);
    // this.onClickNotification = this.onClickNotification.bind(this);
    this.renderNotifications = this.renderNotifications.bind(this);
    this.onMarkAsRead = this.onMarkAsRead.bind(this);

    this.state = {
      dropActive: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
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
        responsive: true,
        className: s.drop,
        containerClassName: s.container,
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
    const { user, loadNotificationList: loadNotifications } = this.props;
    loadNotifications({ first: 10, userId: user.id });
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
    // eslint-disable-next-line react/destructuring-assignment
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
    let component;
    if (status.pending && !notifications.length) {
      let n = 1;
      /* eslint-disable */
      const placeHolder = Array.apply(null, {
        length: 5,
      }).map(() => ({ id: n++ }));
      /* eslint-enable */
      component = (
        <NotificationDrop
          notifications={placeHolder}
          unreadNotifications={user.unreadNotifications}
          showSpinner={false}
          notificationComponent={NotificationSkeleton}
          onMarkAsRead={this.onMarkAsRead}
        />
      );
    } else {
      component = (
        <NotificationDrop
          notifications={notifications}
          unreadNotifications={user.unreadNotifications}
          showSpinner={status.pending}
          notificationComponent={Notification}
          onMarkAsRead={this.onMarkAsRead}
        />
      );
    }
    // Should the DropComponent handle all the context-related code?
    return (
      <StyleContext.Provider value={{ insertCss: this.context.insertCss }}>
        {component}
      </StyleContext.Provider>
    );
  }

  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }
    let numUnread;
    if (user.unreadNotifications > 0) {
      numUnread = user.unreadNotifications;
    }
    const { dropActive } = this.state;
    return (
      // eslint-disable-next-line
      <div onClick={this.toggleMenu} ref={elm => (this.componentRef = elm)}>
        <div
          className={cn(
            s.notification,
            numUnread ? s.unread : null,
            dropActive && s.active,
          )}
        >
          <span>{numUnread && user.unreadNotifications}</span>
          <svg
            version="1.1"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
            role="img"
            aria-label="menu"
          >
            <path
              fill="none"
              strokeWidth="2"
              d={dropActive ? ICONS.close : ICONS.bell}
            />
          </svg>
        </div>
      </div>
    );
  }
}

NotificationMenu.propTypes = {
  loadNotificationList: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unreadNotifications: PropTypes.number,
  }),
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  clearNotifications: PropTypes.func.isRequired,
  status: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
};

NotificationMenu.contextTypes = {
  intl: PropTypes.object,
  insertCss: PropTypes.func,
};

NotificationMenu.defaultProps = {
  user: null,
  notifications: null,
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

export default connect(
  mapPropsToState,
  mapDispatch,
)(withStyles(s)(NotificationMenu));
