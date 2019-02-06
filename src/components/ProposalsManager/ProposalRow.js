import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import TableRow from '../TableRow';
import PollState from '../PollState';

function ProposalRow({ id, title, pollOne, pollTwo, state, onClickMenu }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  const poll = pollOne || pollTwo;
  return (
    <TableRow onClick={() => onClickMenu({ id })}>
      <td>{title}</td>
      <td>{state}</td>
      <td>
        <PollState
          compact
          allVoters={poll.allVoters}
          upvotes={poll.upvotes}
          downvotes={poll.downvotes}
          thresholdRef={poll.mode.thresholdRef}
          threshold={poll.threshold}
          unipolar={poll.mode.unipolar}
        />
      </td>
      <td>
        <FormattedDate
          value={poll.endTime}
          day="numeric"
          month="numeric"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </td>
    </TableRow>
  );
}

ProposalRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  pollOne: PropTypes.shape({}),
  pollTwo: PropTypes.shape({}),
  id: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
};
ProposalRow.defaultProps = {
  pollOne: null,
  pollTwo: null,
};

export default ProposalRow;
