import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { userList as userListSchema } from '../../store/schema';
import { updateUser, loadUserList } from '../../actions/user';

class UserPanel extends React.Component {
  static propTypes = {
    userList: PropTypes.arrayOf(PropTypes.object),
    filter: PropTypes.string.isRequired,
    loadUserList: PropTypes.func,
    updateUser: PropTypes.func,
  };

  componentDidMount() {
    this.props.loadUserList(4);
  }
  render() {
    return (
      <div>
        <h1>USERS WITH STATUS VIEWER</h1>
        {this.props.userList.map(user => (
          <p>
            {' '}{user.id} {user.name} {user.surname} {user.role && user.role.type} <button
              onClick={() => {
                this.props.updateUser({ id: user.id, roleId: 3 });
              }}
            >
              RANK UP{' '}
            </button>
          </p>
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
    u => u.role.type === 'guest',
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
