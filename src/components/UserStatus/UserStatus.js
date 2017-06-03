import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { logout } from '../../actions/session';
import s from './UserStatus.css';
import { getSessionUser } from '../../reducers';
import Link from '../Link';

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
  }
  render() {
    return (
      <div>
        {this.props.user &&
          this.props.user.id &&
          <div style={{ display: 'flex' }}>
            <span>
              <Link to={'/account'}>
                <img className={s.avatar} src={this.props.user.avatar} alt="IMG" />
              </Link>
            </span>
            <span>
              <div>
                {this.props.user.name}
              </div>
              <button
                onClick={() => {
                  this.props.logout();
                }}
              >
                LOGOUT
              </button>
            </span>
          </div>}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  user: getSessionUser(state),
});
const mapDispatch = {
  logout,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserStatus));
