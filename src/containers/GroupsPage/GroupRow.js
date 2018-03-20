import React from 'react';
import PropTypes from 'prop-types';

import TableRow from '../../components/TableRow';

function GroupRow({ displayName, onClickMenu }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

  return (
    <TableRow onClick={() => onClickMenu('SHOW')}>
      <td style={{ minWidth: '84px' }}>{displayName}</td>
    </TableRow>
  );
}

GroupRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  displayName: PropTypes.string.isRequired,
};

export default GroupRow;
