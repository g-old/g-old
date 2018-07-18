import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { logout } from '../../actions/session';
import { getSessionUser } from '../../reducers';
import Menu from '../Menu';
import Button from '../Button';
import history from '../../history';

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
      id: PropTypes.int,
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
    this.props.logout();
  }

  render() {
    let userAvatar = null;
    let avatar;
    if (this.props.user) {
      if (this.props.user.avatar) {
        avatar = (
          <img
            style={{
              marginLeft: '0.15rem',
              boxShadow: '0 0 0 2px white',
              borderRadius: '2px',
              height: '2.2rem',
              width: '2.2rem',
              verticalAlign: 'bottom',
            }}
            src={this.props.user.avatar}
            alt="IMG"
          />
        );
      } else {
        avatar = (
          <svg
            version="1.1"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
            role="img"
            aria-label="user"
          >
            <path
              fill="none"
              stroke="#000"
              strokeWidth="2"
              d="M8,24 L8,19 M16,24 L16,19 M3,24 L3,19 C3,14.0294373 7.02943725,11 12,11 C16.9705627,11 21,14.0294373 21,19 L21,24 M12,11 C14.7614237,11 17,8.76142375 17,6 C17,3.23857625 14.7614237,1 12,1 C9.23857625,1 7,3.23857625 7,6 C7,8.76142375 9.23857625,11 12,11 Z"
            />
          </svg>
        );
      }
      userAvatar = (
        <div style={{ maxWidth: '100px' }}>
          <Menu
            withControl
            dropAlign={{ top: 'top', left: 'left' }}
            icon={avatar}
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
          {/* <span style={{ fontSize: '2em', fontWeight: 600 }}>G</span> */}
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
)(UserStatus);
