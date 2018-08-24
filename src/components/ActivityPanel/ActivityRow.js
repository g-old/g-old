import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

import TableRow from '../TableRow';

import UserThumbnail from '../UserThumbnail';

function ActivityTableRow({ type, onClickMenu, verb, actor, createdAt }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow onClick={() => onClickMenu('SHOW')}>
      <td style={{ textAlign: 'left' }}>
        <UserThumbnail user={actor} />
      </td>
      <td>{type}</td>
      <td>{verb}</td>
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
    </TableRow>
  );
}

ActivityTableRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  verb: PropTypes.string.isRequired,
  actor: PropTypes.shape({}).isRequired,
  createdAt: PropTypes.string.isRequired,
};

ActivityTableRow.defaultProps = {};

export default ActivityTableRow;
