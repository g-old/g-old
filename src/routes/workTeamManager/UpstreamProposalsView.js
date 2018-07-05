import React from 'react';
import PropTypes from 'prop-types';
import AccordionPanel from '../../components/AccordionPanel';
import ListView from '../../components/ListView';
import ProposalPreview from '../../components/ProposalPreview';
import AssetsTable from '../../components/AssetsTable';
import ProposalStatusRow from './ProposalStatusRow';
import Accordion from '../../components/Accordion';

const UpstreamProposalsView = ({
  loadProposals,
  loadMoreProposals,
  pageInfo,
  proposals,
  loadProposalsState,
  linkedProposals,
  onProposalClick,
}) => (
  <Accordion>
    <AccordionPanel
      heading="Accepted proposals from WTs"
      onActive={loadProposals}
    >
      <ListView
        onRetry={loadProposals}
        onLoadMore={loadMoreProposals}
        pageInfo={pageInfo}
      >
        {proposals.map(
          s => s && <ProposalPreview proposal={s} onClick={onProposalClick} />,
        )}
      </ListView>
    </AccordionPanel>
    <AccordionPanel heading="State of Proposals" onActive={loadProposalsState}>
      <AssetsTable
        onClickMenu={onProposalClick}
        allowMultiSelect
        searchTerm=""
        noRequestsFound="No requests found"
        checkedIndices={[]}
        assets={
          linkedProposals
            ? linkedProposals.filter(lP => lP.proposal.state === 'accepted')
            : []
        }
        row={ProposalStatusRow}
        tableHeaders={['title', 'lastPoll', 'state', 'closed at']}
      />
    </AccordionPanel>
  </Accordion>
);

UpstreamProposalsView.propTypes = {
  loadProposals: PropTypes.func.isRequired,
  loadMoreProposals: PropTypes.func.isRequired,
  pageInfo: PropTypes.shape({}).isRequired,
  proposals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  loadProposalsState: PropTypes.func.isRequired,
  linkedProposals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onProposalClick: PropTypes.func.isRequired,
};

export default UpstreamProposalsView;
