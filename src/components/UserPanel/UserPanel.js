import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser, loadUserList } from '../../actions/user';
import FetchError from '../FetchError';
import {
  getVisibleUsers,
  getUsersIsFetching,
  getUsersErrorMessage,
  getSessionUser,
} from '../../reducers';

class UserPanel extends React.Component {
  static propTypes = {
    userList: PropTypes.arrayOf(PropTypes.object),
    loadUserList: PropTypes.func,
    updateUser: PropTypes.func,
    isFetching: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  componentDidMount() {
    this.props.loadUserList('viewer');
  }
  render() {
    const { isFetching, errorMessage, userList } = this.props;
    if (isFetching && !userList.length) {
      return <p>Loading...</p>;
    }
    if (errorMessage && !userList.length) {
      return (
        <FetchError message={errorMessage} onRetry={() => this.props.loadUserList('viewer')} />
      );
    }
    return (
      <div>

        <h1>USERS WITH STATUS VIEWER</h1>
        {this.props.userList.map(user => (
          <div key={user.id} style={{ marginBottom: '0.5em' }}>
            <span>
              <img
                style={{ width: '4em', height: '4em', borderRadius: '30%' }}
                src={user.avatar}
                alt="IMG"
              />

              {user.name}
              {' '}
              {user.surname}
              {' '}
              {user.role && user.role.type}
              {' '}
              {!user.avatar &&
                <span style={{ borderBottom: '1px solid red' }}>
                  {'PIC MISSING!'}
                </span>}
              <span style={{ marginLeft: '5em' }}>
                <button
                  onClick={() => {
                    alert('TO IMPLEMENT');
                  }}
                >
                  INSPECT
                </button>
                <button
                  onClick={() => {
                    this.props.updateUser({ id: user.id, role: 'guest' });
                  }}
                >
                  RANK UP{' '}
                </button>
              </span>
            </span>
          </div>
        ))}
        <h1>USERS WITH STATUS GUEST</h1>
        <h1>FIND USER</h1>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const filter = 'viewer';
  return {
    user: getSessionUser(state),
    userList: getVisibleUsers(state, filter),
    isFetching: getUsersIsFetching(state, filter),
    errorMessage: getUsersErrorMessage(state, filter),
  };
};

const mapDispatch = {
  updateUser,
  loadUserList,
};

export default connect(mapStateToProps, mapDispatch)(UserPanel);
