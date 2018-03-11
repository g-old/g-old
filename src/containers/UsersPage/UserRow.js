import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import TableRow from '../../components/TableRow';
import PollState from '../../components/PollState';

function UserRow({ proposal = {}, state, onClickMenu }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  const endTime = proposal.pollTwo
    ? proposal.pollTwo.closedAt
    : proposal.pollOne.closedAt;

  return (
    <TableRow onClick={() => onClickMenu('EDIT')}>
      <td style={{ minWidth: '84px' }}>{proposal.title}</td>

      <td>
        <PollState compact {...proposal.pollOne} />
      </td>
      <td>
        <span>{state}</span>
      </td>
      <td>
        <FormattedRelative value={endTime} />
      </td>
    </TableRow>
  );
}

UserRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
  proposal: PropTypes.shape({}).isRequired,
};

export default UserRow;
