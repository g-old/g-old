import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { logout } from '../../actions/session';
import s from './UserStatus.css';
import Link from '../Link';

class UserStatus extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
  };
  render() {
    return (
      <div>
        {this.props.user &&
          this.props.user.id &&
          <span>
            <Link to={'/account'}>
              <img
                className={s.avatar}
                src={this.props.user.avatar}
                alt="IMG"
              />
            </Link>
            {this.props.user.name}
            <button
              onClick={() => {
                this.props.logout();
              }}
            >
              LOGOUT
            </button>
          </span>}
      </div>
    );
  }
}
const mapStateToProps = store => {
  const user = store.entities.users ? store.entities.users[store.user] : {};
  return {
    user,
  };
};
const mapDispatch = {
  logout,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserStatus));
