import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
/* eslint-disable css-modules/no-unused-class */
import { FormattedRelative } from 'react-intl';
import s from './ProposalStatusRow.css';
import TableRow from '../../components/TableRow';
import PollState from '../../components/PollState';

function ProposalStatusRow({ proposal = {}, state, onClickMenu }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  if (!proposal) return null;
  const endTime = proposal.pollTwo
    ? proposal.pollTwo.closedAt
    : proposal.pollOne.closedAt;

  return (
    <TableRow className={s.row} onClick={() => onClickMenu('EDIT', proposal)}>
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

ProposalStatusRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
  proposal: PropTypes.shape({}).isRequired,
};

export default withStyles(s)(ProposalStatusRow);
