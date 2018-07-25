import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import TableRow from '../../components/TableRow';
import UserThumbnail from '../../components/UserThumbnail';

function RequestTableRow({
  requester,
  processor,
  deniedAt,
  createdAt,
  id,
  onClickMenu,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow onClick={() => onClickMenu('EDIT', id)}>
      <td style={{ minWidth: '84px' }}>
        {requester && <UserThumbnail user={requester} />}
      </td>
      <td>{createdAt && <FormattedRelative value={createdAt} />}</td>
      <td>{deniedAt && <FormattedRelative value={deniedAt} />}</td>
      <td> {processor && <UserThumbnail user={processor} />}</td>
    </TableRow>
  );
}

RequestTableRow.propTypes = {
  createdAt: PropTypes.string.isRequired,
  onClickMenu: PropTypes.func.isRequired,
  requester: PropTypes.shape({}).isRequired,
  processor: PropTypes.shape({}),
  deniedAt: PropTypes.string,
  id: PropTypes.string.isRequired,
};

RequestTableRow.defaultProps = {
  processor: null,
  deniedAt: null,
};

export default RequestTableRow;
