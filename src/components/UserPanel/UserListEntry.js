import React from 'react';
import { FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import Avatar from '../Avatar';

class UserListEntry extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      createdAt: PropTypes.string,
      lastLogin: PropTypes.string,
    }).isRequired,
    onProfileClick: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.onProfileClick({ id: this.props.user.id });
  }

  render() {
    const { user } = this.props;
    return (
      <tr onClick={this.onClick}>
        <td>
          <Avatar user={user} />
        </td>
        <td>{`${user.name} ${user.surname}`}</td>
        <td>
          <FormattedDate value={user.createdAt} />
        </td>
        <td>
          {user.lastLogin ? <FormattedDate value={user.lastLogin} /> : null}
        </td>
      </tr>
    );
  }
}

export default UserListEntry;
