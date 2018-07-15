import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../../components/Avatar';
import Box from '../../components/Box';

const UserListItem = ({ user, onClick }) => (
  <Box pad onClick={() => onClick(user.id)} align>
    <Avatar user={user} />
    <span>
      {user.name} {user.surname}
    </span>
  </Box>
);

UserListItem.propTypes = {
  user: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default UserListItem;
