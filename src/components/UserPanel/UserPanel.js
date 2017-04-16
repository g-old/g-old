import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { userList as userListSchema } from '../../store/schema';
import { updateUser, loadUserList } from '../../actions/user';

class UserPanel extends React.Component {
  static propTypes = {
    userList: PropTypes.arrayOf(PropTypes.object),
    //  filter: PropTypes.string.isRequired,
    loadUserList: PropTypes.func,
    updateUser: PropTypes.func,
  };

  componentDidMount() {
    this.props.loadUserList('viewer');
  }
  render() {
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
  const data = state.entities.users || {};
  // TODO allProposals in store?
  const userData = Object.keys(data).map(key => data[key]);
  const userList = denormalize(userData, userListSchema, state.entities).filter(
    u => u.role.type === 'viewer',
  );
  const user = state.user;
  return {
    user,
    userList,
  };
};

const mapDispatch = {
  updateUser,
  loadUserList,
};

export default connect(mapStateToProps, mapDispatch)(UserPanel);
