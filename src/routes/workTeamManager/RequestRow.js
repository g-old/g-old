import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import TableRow from '../../components/TableRow';
import Avatar from '../../components/Avatar';
import Box from '../../components/Box';

function RequestTableRow({
  requester,
  processor,
  type,
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
        <Box pad align>
          {requester && <Avatar user={requester} />}
          {requester && ` ${requester.name} ${requester.surname}`}
        </Box>
      </td>
      <td>
        <span>{type}</span>
      </td>
      <td>{processor && `${processor.name} ${processor.surname}`}</td>
      <td>{createdAt && <FormattedRelative value={createdAt} />}</td>
      <td>{deniedAt && <FormattedRelative value={deniedAt} />}</td>
    </TableRow>
  );
}

RequestTableRow.propTypes = {
  createdAt: PropTypes.string.isRequired,
  onClickMenu: PropTypes.func.isRequired,
  requester: PropTypes.shape({}).isRequired,
  processor: PropTypes.shape({}),
  type: PropTypes.string.isRequired,
  deniedAt: PropTypes.string,
  id: PropTypes.string.isRequired,
};

RequestTableRow.defaultProps = {
  processor: null,
  deniedAt: null,
};

export default RequestTableRow;
