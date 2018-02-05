import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Accordion from '../../components/Accordion';
import Button from '../../components/Button';

import AccordionPanel from '../../components/AccordionPanel';
import {
  loadWorkTeam,
  joinWorkTeam,
  loadProposalStatus,
} from '../../actions/workTeam';
import {
  createProposal,
  loadTags,
  loadProposalsList,
} from '../../actions/proposal';
import { findUser } from '../../actions/user';
import ProposalsManager from '../../components/ProposalsManager';
import ProposalListView from '../../components/ProposalListView';
import ProposalStatusRow from './ProposalStatusRow';

import {
  loadRequestList,
  deleteRequest,
  updateRequest,
} from '../../actions/request';

import {
  getWorkTeam,
  getVisibleRequests,
  getDiscussionUpdates,
  getRequestUpdates,
  getWorkTeamStatus,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getProposalsPage,
  getVisibleProposals,
} from '../../reducers';
import DiscussionInput from '../../components/DiscussionInput';
import ProposalInput from '../../components/ProposalInput';
import Tabs from '../../components/Tabs';
import Tab from '../../components/Tab';
import RequestsList from '../../components/RequestsList';
import Request from '../../components/Request';
import AssetsTable from '../../components/AssetsTable';

// import FetchError from '../../components/FetchError';
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
  phaseOnePoll: {
    id: 'proposalManager.phaseOnePoll',
    defaultMessage: 'TR: 25 - PHASE ONE - NO STATEMENTS',
    description: 'PhaseOnePoll presets',
  },
  phaseTwoPoll: {
    id: 'proposalManager.phaseTwoPoll',
    defaultMessage: 'TR: 50 - PHASE TWO - WITH STATEMENTS',
    description: 'PhaseTwoPoll presets',
  },
  survey: {
    id: 'proposalManager.survey',
    defaultMessage: 'Survey',
    description: 'Survey presets',
  },
  tags: {
    id: 'tags',
    defaultMessage: 'Tags',
    description: 'Tags',
  },
});
const defaultPollValues = {
  1: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: 'all',
  },
  2: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: 'voters',
  },
  3: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: 'voters',
  },
};

const pollOptions = [
  {
    value: '1',
    label: <FormattedMessage {...messages.phaseOnePoll} />,
    mId: messages.phaseOnePoll.id,
  },
  {
    value: '2',
    label: <FormattedMessage {...messages.phaseTwoPoll} />,
    mId: messages.phaseTwoPoll.id,
  },
  {
    value: '3',
    label: <FormattedMessage {...messages.survey} />,
    mId: messages.survey.id,
  },
];
class WorkTeamManagement extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    loadRequestList: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
    requests: PropTypes.arrayOf(PropTypes.shape({})),
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    workTeamUpdates: PropTypes.arrayOf(PropTypes.shape({})),
    requestUpdates: PropTypes.arrayOf(PropTypes.shape({})),
    discussionUpdates: PropTypes.arrayOf(PropTypes.shape({})),
    workTeam: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    joinWorkTeam: PropTypes.func.isRequired,
    updateRequest: PropTypes.func.isRequired,
    loadTags: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
    loadProposalsList: PropTypes.func.isRequired,
    loadProposalStatus: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    pageInfo: PropTypes.shape({}),
  };

  static defaultProps = {
    requests: null,
    workTeamUpdates: null,
    requestUpdates: null,
    discussionUpdates: null,
    proposalUpdates: null,
    isFetching: null,
    errorMessage: null,
    proposals: null,
    pageInfo: null,
  };
  constructor(props) {
    super(props);
    this.state = { showRequest: false };
    this.onRequestClick = this.onRequestClick.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onAllowRequest = this.onAllowRequest.bind(this);
    this.onDenyRequest = this.onDenyRequest.bind(this);
    this.onProposalClick = this.onProposalClick.bind(this);
  }
  componentDidMount() {
    this.props.loadRequestList({
      first: 10,
      type: 'joinWT',
      contentId: this.props.workTeam.id,
    });
  }

  onRequestClick(action, data) {
    this.setState({ showRequest: true, currentRequest: data });
  }
  onAllowRequest() {
    const { type, requester } = this.state.currentRequest;
    if (type === 'joinWT') {
      this.props.joinWorkTeam(
        {
          id: this.props.workTeam.id,
          memberId: requester.id,
        },
        true,
      );
      this.setState({ joining: true });
    }
  }

  onDenyRequest() {
    const { id } = this.state.currentRequest;

    alert('TO IMPLEMENT');
    this.props.updateRequest({ id, deny: true });
    this.setState({ joining: false });
  }

  onCancel() {
    this.setState({ showRequest: false });
  }

  // eslint-disable-next-line
  onProposalClick() {
    alert('TO IMPLEMENT');
    // should open proposalManager
    // then you can handle actions from there
  }
  render() {
    const {
      workTeamUpdates = {},
      requestUpdates = {},
      discussionUpdates = {},
      workTeam = {},
      isFetching,
      errorMessage,
      pageInfo = {},
      proposals = [],
    } = this.props;
    let content;
    if (this.state.showRequest) {
      const updates = this.state.joining ? workTeamUpdates : requestUpdates;
      content = (
        <Request
          onAllow={this.onAllowRequest}
          onDeny={this.onDenyRequest}
          onCancel={this.onCancel}
          {...this.state.currentRequest}
          updates={updates}
        />
      );
    } else {
      content = (
        <RequestsList
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.onRequestClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound={'No requests found'}
          checkedIndices={[]}
          requests={this.props.workTeam.requests || []}
          tableHeaders={[
            'name',
            'request',
            'processor',
            'created_at',
            'denied_at',
            '',
            '',
          ]}
        />
      );
    }
    let mainTeamView = <div />;
    if (workTeam.mainTeam) {
      mainTeamView = [
        <AccordionPanel
          heading="Accepted proposals from WTs"
          onActive={() =>
            this.props.loadProposalsList({
              state: 'pending',
              workTeamId: workTeam.id,
            })}
        >
          <ProposalListView
            proposals={proposals}
            onProposalClick={this.onProposalClick}
            pageInfo={pageInfo}
            filter={'pending'}
            onLoadMore={this.props.loadProposalsList}
            isFetching={isFetching}
            error={errorMessage}
          />
        </AccordionPanel>,
        <AccordionPanel
          heading="State of Proposals"
          onActive={() =>
            this.props.loadProposalStatus({
              state: 'pending',
              id: workTeam.id,
            })}
        >
          <AssetsTable
            onClickCheckbox={this.onClickCheckbox}
            onClickMenu={this.onProposalClick}
            allowMultiSelect
            searchTerm=""
            noRequestsFound={'No requests found'}
            checkedIndices={[]}
            assets={this.props.workTeam.linkedProposals || []}
            row={ProposalStatusRow}
            tableHeaders={['title', 'lastPoll', 'state', 'closed at', '', '']}
          />
        </AccordionPanel>,
      ];
    }
    return (
      <Tabs>
        <Tab title="Discussions">
          <Accordion>
            <AccordionPanel heading="Create discussion">
              <DiscussionInput
                workTeamId={this.props.id}
                updates={discussionUpdates}
              />
            </AccordionPanel>
          </Accordion>
        </Tab>
        <Tab title="Proposals">
          <Accordion>
            <AccordionPanel
              heading="Create proposal"
              onActive={() => {
                this.props.loadTags();
              }}
            >
              <ProposalInput
                workTeamId={this.props.id}
                maxTags={8}
                pollOptions={pollOptions}
                defaultPollValues={defaultPollValues}
              />
            </AccordionPanel>
            <AccordionPanel heading="Manage proposals">
              <ProposalsManager
                proposals={this.props.workTeam.proposals || []}
                workTeamId={this.props.id}
                pollOptions={pollOptions}
                defaultPollValues={defaultPollValues}
              />
            </AccordionPanel>
            {mainTeamView}
          </Accordion>
        </Tab>
        <Tab title="Requests">{content}</Tab>
        <Tab title="Settings">
          <Button label="Edit" />
          {'TODO WORKTEAMEDIT'}
        </Tab>
      </Tabs>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  requests: getVisibleRequests(state, 'all'),
  discussionUpdates: getDiscussionUpdates(state),
  requestUpdates: getRequestUpdates(state),
  workTeamUpdates: getWorkTeamStatus(state),
  isFetching: getProposalsIsFetching(state, 'pending'),
  errorMessage: getProposalsErrorMessage(state, 'pending'),
  pageInfo: getProposalsPage(state, 'pending'),
  proposals: getVisibleProposals(state, 'pending'),
});

const mapDispatch = {
  loadWorkTeam,
  loadRequestList,
  deleteRequest,
  joinWorkTeam,
  updateRequest,
  createProposal,
  findUser,
  loadTags,
  loadProposalsList,
  loadProposalStatus,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamManagement);
