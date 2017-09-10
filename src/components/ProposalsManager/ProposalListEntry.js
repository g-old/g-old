import React from 'react';
import { FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import PollState from '../PollState';

class ProposalListEntry extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({ id: PropTypes.string }).isRequired,
    onProposalClick: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.props.onProposalClick({ id: this.props.proposal.id });
  }
  render() {
    const proposal = this.props.proposal;
    const poll = proposal.pollOne;
    return (
      <tr onClick={this.onClick}>
        <td style={{ textAlign: 'left' }}>
          {proposal.title}
        </td>
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
        <td style={{ textAlign: 'right' }}>
          <FormattedDate
            value={poll.endTime}
            day="numeric"
            month="numeric"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        </td>
      </tr>
    );
  }
}

export default ProposalListEntry;
