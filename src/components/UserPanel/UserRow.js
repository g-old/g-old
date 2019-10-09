import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

import TableRow from '../TableRow';

import UserThumbnail from '../UserThumbnail';

function UserTableRow({
  name,
  surname,
  thumbnail,
  onClickMenu,
  lastLogin,
  verificationStatus,
  createdAt,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        onClickMenu('SHOW');
      }}
    >
      <td style={{ textAlign: 'left' }}>
        <UserThumbnail user={{ thumbnail, name, surname }} />
      </td>
      <td>{name}</td>
      <td>{verificationStatus}</td>
      <td>
        {
          <FormattedDate
            day="numeric"
            month="numeric"
            year="numeric"
            hour="numeric"
            minute="numeric"
            value={createdAt}
          />
        }
      </td>
      <td>
        {
          <FormattedDate
            day="numeric"
            month="numeric"
            year="numeric"
            hour="numeric"
            minute="numeric"
            value={lastLogin}
          />
        }
      </td>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  surname: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  lastLogin: PropTypes.string.isRequired,
  verificationStatus: PropTypes.string.isRequired,
  actor: PropTypes.shape({}).isRequired,
  createdAt: PropTypes.string.isRequired,
};

UserTableRow.defaultProps = {};

export default UserTableRow;
