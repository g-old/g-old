import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import TableRow from '../TableRow';
import PollState from '../PollState';
import { ApprovalStates } from '../../organization';

export const Symbols = {
  approved: (
    <svg
      style={{ stroke: '#333', strokeWidth: '2px', width: '1.5em' }}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
    >
      <path fill="none" d="M6,11.3 L10.3,16 L18,6.2" />
    </svg>
  ),
  denied: (
    <svg style={{ width: '1.5em' }} viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="#f00"
        strokeWidth="2"
        d="M3,3 L21,21 M3,21 L21,3"
      />
    </svg>
  ),
  pending: '?',
};

function getApprovation(value, states) {
  let res;
  // eslint-disable-next-line no-bitwise
  if (value & states[0]) {
    res = Symbols.approved;
    // eslint-disable-next-line no-bitwise
  } else if (value & states[1]) {
    res = Symbols.denied;
  } else {
    res = Symbols.pending;
  }
  return res;
}
const states = [
  [ApprovalStates.CONTENT_APPROVED, ApprovalStates.CONTENT_DENIED],
  [ApprovalStates.TOPIC_APPROVED, ApprovalStates.TOPIC_DENIED],
];

function ProposalRow({
  id,
  title,
  pollOne,
  pollTwo,
  state,
  onClickMenu,
  approvalState,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  const poll = pollOne || pollTwo;
  return (
    <TableRow onClick={() => onClickMenu({ id })}>
      <td>{title}</td>
      <td>{states.map(st => getApprovation(approvalState, st))}</td>
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
  approvalState: PropTypes.number.isRequired,
};
ProposalRow.defaultProps = {
  pollOne: null,
  pollTwo: null,
};

export default ProposalRow;
