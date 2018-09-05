import React from 'react';
import PropTypes from 'prop-types';

import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
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
    defaultPollValues: PropTypes.shape({}).isRequired,
    pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { settings: { pollOption: { value: '2' } } };
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.handleProposalClick = this.handleProposalClick.bind(this);
    this.handleLayerClosing = this.handleLayerClosing.bind(this);
  }

  handleProposalClick({ id }) {
    this.setState({ showDetails: true, activeProposal: id });
  }

  // TODO refactor - same in ProposalInput
  handleValueChanges(e) {
    let value;
    switch (e.target.name) {
      case 'dateTo':
      case 'dateFrom':
      case 'timeFrom':
      case 'timeTo':
      case 'threshold':
      case 'thresholdRef':
      case 'pollOption': {
        value = e.target.value; // eslint-disable-line
        break;
      }
      case 'withStatements':
      case 'unipolar':
      case 'secret': {
        value = e.target.checked; // eslint-disable-line
        break;
      }

      default:
        throw Error(`Element not recognized: ${e.target.name}`);
    }
    this.setState(prevState => ({
      settings: { ...prevState.settings, [e.target.name]: value },
    }));
  }

  handleStateChange() {
    const { updateProposal } = this.props;
    const { action, currentProposal } = this.state;
    updateProposal({
      id: currentProposal,
      state: action,
      ...(currentProposal.workTeamId && {
        workTeamId: currentProposal.workTeamId,
      }),
    });
    this.setState({ currentProposal: null });
  }

  handleLayerClosing() {
    this.setState({ showDetails: false });
  }

  handleOnSubmit() {
    // TODO sanitize input
    // TODO refactor -
    const { updateProposal, defaultPollValues } = this.props;
    const { settings, currentProposal } = this.state;
    let { dateFrom, timeFrom, dateTo, timeTo } = settings;
    let startTime = null;

    let endTime = null;
    if (dateFrom || timeFrom) {
      dateFrom = dateFrom || new Date();
      timeFrom = timeFrom || utcCorrectedDate().slice(11, 16);
      startTime = concatDateAndTime(dateFrom, timeFrom);
    }
    if (dateTo || timeTo) {
      dateTo = dateTo || new Date();
      timeTo = timeTo || utcCorrectedDate().slice(11, 16);

      endTime = concatDateAndTime(dateTo, timeTo);
    }
    const {
      withStatements,
      secret,
      threshold,
      thresholdRef,
      unipolar,
      pollOption,
    } = settings;
    const pollingModeId = pollOption.value;

    updateProposal({
      id: currentProposal,
      poll: {
        startTime,
        endTime,
        secret,
        threshold: threshold || defaultPollValues[pollingModeId].threshold,
        mode: {
          withStatements,
          id: pollingModeId,
          unipolar,
          thresholdRef,
        },
      },
      ...(currentProposal.workTeamId && {
        workTeamId: currentProposal.workTeamId,
      }),
    });
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
      pollOptions,
      defaultPollValues,
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
          <Layer onClose={this.handleLayerClosing}>
            <ProposalActions
              pollOptions={pollOptions}
              defaultPollValues={defaultPollValues}
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
            tableHeaders={['Title', 'State', 'Poll', 'Endtime', '']}
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
