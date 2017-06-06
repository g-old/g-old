import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../actions/session';
import { getSessionUser } from '../../reducers';
import Menu from '../Menu';
import Button from '../Button';
import history from '../../history';

const onVisitProfile = (e) => {
  if (e.button !== 0) {
    // leftclick
    return;
  }

  if (e.defaultPrevented === true) {
    return;
  }

  e.preventDefault();
  history.push('/account');
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
    if (this.props.user) {
      userAvatar = (
        <div style={{ maxWidth: '100px' }}>
          <Menu
            withControl
            dropAlign={{ top: 'top', left: 'left' }}
            icon={
              <img
                style={{ height: '2em', width: '2em', marginBottom: '12px' }}
                src={this.props.user.avatar}
                alt="IMG"
              />
            }
          >
            <Button plain onClick={onVisitProfile} label="Profile" />
            <Button plain onClick={this.onLogout} label="Logout" />
          </Menu>
        </div>
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

export default connect(mapStateToProps, mapDispatch)(UserStatus);
