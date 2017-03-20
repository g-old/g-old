import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import ProposalPreview from '../../components/ProposalPreview';
import { proposalList as proposalListSchema } from '../../store/schema';
import Navigation from '../../components/ProposalsNavigation';

const getVisibleProposals = (proposals, filter) => {
  switch (filter) {
    case 'active': {
      return proposals.filter(p => p.state === 'proposed' || p.state === 'voting');
    }
    case 'accepted': {
      return proposals.filter(p => p.state === 'accepted');
    }
    case 'repelled': {
      return proposals.filter(p => p.state === 'rejected' || p.state === 'revoked');
    }
    default: {
      return proposals;
    }
  }
};
class ProposalContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.object.isRequired,
    state: PropTypes.string.isRequired,
  };
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.proposals != null;
  }

  render() {
    if (this.isReady()) {
      return (
        <div>
          <Navigation />
          {this.props.proposals.map(proposal => (
            <ProposalPreview key={proposal.id} proposal={proposal} />
          ))}

        </div>
      );
    }
    return <div>STILL LOADING ...</div>;
  }
}
ProposalContainer.propTypes = {};
// TODO implement memoiziation with reselect
const mapStateToProps = (state, ownProps) => {
  const data = state.entities.proposals;
  // TODO allProposals in store?
  const proposalsData = Object.keys(data).map(key => data[key]);
  const proposals = getVisibleProposals(
    denormalize(proposalsData, proposalListSchema, state.entities),
    ownProps.state,
  );

  const user = state.user; // or pass via context
  return {
    proposals,
    user,
  };
};

export default connect(mapStateToProps)(ProposalContainer);
