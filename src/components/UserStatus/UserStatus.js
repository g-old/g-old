import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './UserStatus.css';
import { logout } from '../../actions/session';
import { getSessionUser } from '../../reducers';
import Menu from '../Menu';
import Button from '../Button';
import history from '../../history';
import Avatar from '../Avatar';

const messages = defineMessages({
  logout: {
    id: 'logout',
    defaultMessage: 'Logout',
    description: 'Label for logout',
  },
  profile: {
    id: 'profile',
    defaultMessage: 'Profile',
    description: 'Label for profile link',
  },
});

const onVisitProfile = e => {
  if (e.button !== 0) {
    // leftclick
    return;
  }
  if (e.defaultPrevented === true) {
    return;
  }
  e.preventDefault();
  history.push(`/account`);
};

const goHome = e => {
  if (e.button !== 0) {
    // leftclick
    return;
  }
  if (e.defaultPrevented === true) {
    return;
  }
  e.preventDefault();
  history.push(`/`);
};

class UserStatus extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.number,
      avatar: PropTypes.string,
      name: PropTypes.string,
    }),
    logout: PropTypes.func.isRequired,
  };

  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.onLogout = this.onLogout.bind(this);
  }

  onLogout() {
    const { logout: exit } = this.props;
    exit();
  }

  render() {
    let userAvatar = null;
    const { user } = this.props;
    if (user) {
      userAvatar = (
        <div style={{ maxWidth: '100px' }}>
          <Menu
            withControl
            dropAlign={{ top: 'top', left: 'left' }}
            icon={<Avatar user={user} className={s.root} />}
          >
            <Button
              plain
              onClick={onVisitProfile}
              label={<FormattedMessage {...messages.profile} />}
            />
            <Button
              plain
              onClick={this.onLogout}
              label={<FormattedMessage {...messages.logout} />}
            />
          </Menu>
        </div>
      );
    } else {
      userAvatar = (
        <Button plain onClick={goHome}>
          <img alt="avatar" width="42px" height="42px" src="/tile.png" />
        </Button>
      );
    }
    return userAvatar;
  }
}
const mapStateToProps = state => ({
  user: getSessionUser(state),
});
const mapDispatch = {
  logout,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(UserStatus));
