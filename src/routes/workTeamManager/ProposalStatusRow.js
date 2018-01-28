import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/* eslint-disable css-modules/no-unused-class */
import { FormattedRelative } from 'react-intl';
import s from './ProposalStatusRow.css';
import TableRow from '../../components/TableRow';

function ProposalStatusRow({ proposal = {}, state, onClickMenu, createdAt }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow className={s.row} onClick={() => onClickMenu('EDIT')}>
      <td style={{ minWidth: '84px' }}>{proposal.title}</td>

      <td>
        <span> {proposal.pollOne}</span>
      </td>
      <td>
        <span>{state}</span>
      </td>
      <td>
        <FormattedRelative value={createdAt} />
      </td>
    </TableRow>
  );
}

ProposalStatusRow.propTypes = {
  createdAt: PropTypes.string.isRequired,
  onClickMenu: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
  proposal: PropTypes.shape({}).isRequired,
};

ProposalStatusRow.defaultProps = {
  checked: null,
  processor: null,
  deniedAt: null,
};

export default withStyles(s)(ProposalStatusRow);
