// @flow
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { getAllProposals, getResourcePageInfo } from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';

import ProposalRow from '../ProposalsManager/ProposalRow';
import AssetsTable from '../AssetsTable';
import Button from '../Button';

export const correctFilter = ({ approvalState, workteam, state }) => ({
  ...(approvalState && { approvalState: approvalState.value }),
  ...(workteam && { workteam: workteam.value }),
  ...(state && { state: state.value }),
});

const messages = defineMessages({
  proposalInput: {
    id: 'proposalInput',
    defaultMessage: 'Create a new proposal',
    description: 'Creating new proposal',
  },
  proposalManager: {
    id: 'proposalManager',
    defaultMessage: 'Manage proposals',
    description: 'Manage proposals',
  },

  tags: {
    id: 'tags',
    defaultMessage: 'Tags',
    description: 'Tags',
  },
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});

const stateFilter = (state, proposal) => {
  switch (state) {
    case 'active':
      return proposal.state === 'proposed' || proposal.state === 'voting';
    case 'repelled':
      return proposal.state === 'revoked' || proposal.state === 'rejected';

    default:
      return state === proposal.state;
  }
};
const approvalStateFilter = (approvalState, proposal) =>
  approvalState === proposal.approvalState;
const workteamFilter = (workteamId, proposal) => {
  // eslint-disable-next-line eqeqeq
  return workteamId == proposal.workTeamId;
};

const proposalFilter = (filterArgs, proposal) => {
  const filters = [];
  if (filterArgs.state) {
    filters.push({ filter: stateFilter, args: filterArgs.state.value });
  }
  if (filterArgs.approvalState) {
    filters.push({
      filter: approvalStateFilter,
      args: filterArgs.approvalState.value,
    });
  }
  if (filterArgs.workteam) {
    filters.push({ filter: workteamFilter, args: filterArgs.workteam.value });
  }
  return filters.every(fn => fn.filter(fn.args, proposal));
};

type Props = {
  pageInfo: pageInfoShape,
  filter: mixed,
  onLoadMore: () => void,
  proposals: Array<proposalShape>,
  onClick: () => void,
};
class ProposalTable extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  handleLoadMore() {
    const { pageInfo, onLoadMore } = this.props;
    onLoadMore(pageInfo.pagination.endCursor);
  }

  render() {
    const { proposals, filter, onClick, pageInfo } = this.props;
    const filteredProposals = proposals.filter(proposal =>
      proposalFilter(filter, proposal),
    );
    return (
      <>
        <AssetsTable
          onClickMenu={onClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={filteredProposals || []}
          row={ProposalRow}
          tableHeaders={[
            'title',
            'approvalState',
            'state',
            'poll',
            'has team',
            'Endtime',
            '',
          ]}
        />

        {pageInfo.pagination.hasNextPage && (
          <Button
            primary
            disabled={pageInfo.pending}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state, { filter }) => ({
  proposals: getAllProposals(state), // TODO CHANGE

  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey(correctFilter(filter)),
  ), // getProposalsPage(state, 'active'),
});

export default connect(mapStateToProps)(ProposalTable);
