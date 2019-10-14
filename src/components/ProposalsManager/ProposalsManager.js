import React from 'react';
import PropTypes from 'prop-types';

import Button from '../Button';
import FetchError from '../FetchError';
import Box from '../Box';
import ProposalActions from '../ProposalActions';
import AssetsTable from '../AssetsTable';
import ProposalRow from './ProposalRow';
import Layer from '../Layer';

class ProposalsManager extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    loadProposals: PropTypes.func.isRequired,
    updateProposal: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.toggleSettings = this.toggleSettings.bind(this);
    this.handleProposalClick = this.handleProposalClick.bind(this);
    this.handleLayerClosing = this.handleLayerClosing.bind(this);
  }

  handleProposalClick({ id }) {
    this.setState({ showDetails: true, activeProposal: id });
  }

  handleLayerClosing() {
    this.setState({ showDetails: false });
  }

  toggleSettings() {
    this.setState(prevState => ({
      displaySettings: !prevState.displaySettings,
    }));
  }

  render() {
    const {
      pageInfo: { errorMessage, pagination, pending },
      proposals = [],
      loadProposals,
      updateProposal,
    } = this.props;
    const { showDetails, activeProposal } = this.state;
    const { intl } = this.context;
    if (pending && !proposals.length) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !proposals.length) {
      return <FetchError message={errorMessage} onRetry={loadProposals} />;
    }
    /*  const toRender = proposals.filter(p => p.state === 'proposed');
    toRender.sort(
      (a, b) => new Date(a.pollOne.endTime) - new Date(b.pollOne.endTime),
    );
*/
    return (
      <Box column>
        {showDetails && (
          <Layer fill onClose={this.handleLayerClosing}>
            <ProposalActions
              intl={intl}
              updateProposal={updateProposal}
              id={activeProposal}
              onFinish={this.handleLayerClosing}
            />
          </Layer>
        )}
        <Box pad>
          <AssetsTable
            onClickCheckbox={this.onClickCheckbox}
            onClickMenu={this.handleProposalClick}
            searchTerm=""
            noRequestsFound="No messages found"
            checkedIndices={[]}
            assets={proposals}
            row={ProposalRow}
            tableHeaders={[
              'Title',
              'Approvation',
              'State',
              'Poll',
              'has team',
              'Endtime',
              '',
            ]}
          />
        </Box>

        {pagination.hasNextPage && (
          <Button
            disabled={pending}
            label="LOAD MORE"
            onClick={() => {
              loadProposals({
                after: pagination.endCursor,
              });
            }}
          />
        )}
      </Box>
    );
  }
}

ProposalsManager.contextTypes = {
  intl: PropTypes.shape({}), // TODO inject intl in PollInput
};
export default ProposalsManager;
