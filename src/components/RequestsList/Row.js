import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/* eslint-disable css-modules/no-unused-class */
import { FormattedRelative } from 'react-intl';
import s from './RequestsList.css';
import TableRow from '../TableRow';
import Avatar from '../Avatar';
import Box from '../Box';

function RequestTableRow({
  requester,
  processor,
  type,
  deniedAt,
  onClickMenu,
  createdAt,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow className={s.row} onClick={() => onClickMenu('EDIT')}>
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
};

RequestTableRow.defaultProps = {
  checked: null,
  processor: null,
  deniedAt: null,
};

export default withStyles(s)(RequestTableRow);