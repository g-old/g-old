import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { logout } from '../../actions/session';
import s from './UserStatus.css';

class UserStatus extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
  };
  render() {
    return (
      <div>
        {this.props.user.id &&
          <span>
            <img
              className={s.avatar}
              src={
                this.props.user.avatar
                  ? this.props.user.avatar
                  : `https://api.adorable.io/avatars/256/${this.props.user.name}${this.props.user.surname}.io.png`
              }
              alt="IMG"
            />
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
  const user = store.user;
  return {
    user,
  };
};
const mapDispatch = {
  logout,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserStatus));
