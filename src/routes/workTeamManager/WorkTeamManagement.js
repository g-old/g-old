import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Accordion from '../../components/Accordion';
import Box from '../../components/Box';
import WorkteamHeader from '../../components/WorkteamHeader';
import AccordionPanel from '../../components/AccordionPanel';
import { joinWorkTeam, loadProposalStatus } from '../../actions/workTeam';
import {
  loadTags,
  loadProposalsList,
  updateProposal,
} from '../../actions/proposal';
import { findUser } from '../../actions/user';
import ProposalsManager from '../../components/ProposalsManager';
import ProposalPreview from '../../components/ProposalPreview';
import ListView from '../../components/ListView';
import ProposalStatusRow from './ProposalStatusRow';

import { deleteRequest, updateRequest } from '../../actions/request';

import {
  getWorkTeam,
  getVisibleRequests,
  getDiscussionUpdates,
  getRequestUpdates,
  getWorkTeamStatus,
  getVisibleProposals,
  getMessageUpdates,
  getWTProposalsByState,
  getResourcePageInfo,
} from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';

import DiscussionInput from '../../components/DiscussionInput';
import ProposalInput from '../../components/ProposalInput';
import Tabs from '../../components/Tabs';
import Tab from '../../components/Tab';
import RequestsList from '../../components/RequestsList';
import Request from '../../components/Request';
import AssetsTable from '../../components/AssetsTable';
import { Groups } from '../../organization';
import history from '../../history';
import MessageInput from '../../components/MessageInput';
import { createMessage } from '../../actions/message';

// import FetchError from '../../components/FetchError';
const messages = defineMessages({
  proposalInput: {
    id: 'proposalInput',
    defaultMessage: 'Create a new proposal',
    description: 'Creating new proposal',
  },
  messages: {
    id: 'label.messages',
    defaultMessage: 'Messages',
    description: 'Messages label',
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
  discussions: {
    id: 'discussions',
    defaultMessage: 'Discussions',
    description: 'Discussions label',
  },
  proposals: {
    id: 'proposals',
    defaultMessage: 'Proposals',
    description: 'Proposals label',
  },
  settings: {
    id: 'settings',
    defaultMessage: 'Settings',
    description: 'Label for settings',
  },
  createDiscussion: {
    id: 'discussion.create',
    defaultMessage: 'Create discussion',
    description: 'Label for Manager',
  },
  requests: {
    id: 'label.requests',
    defaultMessage: 'Requests',
    description: 'Label request',
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
    user: PropTypes.shape({}).isRequired,
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
    loadProposalsList: PropTypes.func.isRequired,
    loadProposalStatus: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({}),
    proposalUpdates: PropTypes.shape({}),
    createMessage: PropTypes.func.isRequired,
    messageUpdates: PropTypes.shape({}).isRequired,
    updateProposal: PropTypes.func.isRequired,
    wtProposals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {
    requests: null,
    workTeamUpdates: null,
    requestUpdates: null,
    discussionUpdates: null,
    proposalUpdates: null,
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
    this.handleLoadProposals = this.handleLoadProposals.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.fetchTags = this.fetchTags.bind(this);
    this.fetchProposalStatus = this.fetchProposalStatus.bind(this);
    this.fetchWTProposals = this.fetchWTProposals.bind(this);
  }

  onRequestClick(action, data) {
    this.setState({ showRequest: true, currentRequest: data });
  }

  onAllowRequest() {
    const {
      currentRequest: { type, requester },
    } = this.state;
    const { joinWorkTeam: join, workTeam } = this.props;
    if (type === 'joinWT') {
      join(
        {
          id: workTeam.id,
          memberId: requester.id,
        },
        true,
      );
      this.setState({ joining: true });
    }
  }

  onDenyRequest() {
    const { currentRequest: id } = this.state;
    const { updateRequest: update } = this.props;
    update({ id, deny: true });
    this.setState({ joining: false });
  }

  onCancel() {
    this.setState({ showRequest: false });
  }

  // eslint-disable-next-line
  onProposalClick(e, data) {
    const proposal = data && data.proposal; // why??
    if (proposal) {
      const poll = proposal.pollTwo || proposal.pollOne;
      history.push(`/proposal/${proposal.id}/${poll && poll.id}`);
    }
    console.error('TO IMPLEMENT');
    // should open proposalManager
    // then you can handle actions from there
  }

  handleLoadMore({ after }) {
    const { loadProposalsList: loadProposals, id } = this.props;
    loadProposals({ after, state: 'pending', workTeamId: id });
  }

  handleLoadProposals() {
    const { loadProposalsList: loadProposals, id } = this.props;
    loadProposals({ state: 'pending', workTeamId: id });
  }

  canAccess() {
    const { workTeam, user } = this.props;
    return (
      /* eslint-disable */
      user.groups & Groups.ADMIN ||
      (workTeam.coordinator && workTeam.coordinator.id == user.id)
    ); /* eslint-enable */
  }

  fetchTags() {
    const { loadTags: fetchTags } = this.props;
    fetchTags();
  }

  fetchProposalStatus() {
    const { loadProposalStatus: loadProposals, id } = this.props;
    loadProposals({
      state: 'pending',
      id,
      first: 30,
    });
  }

  fetchWTProposals({ after } = {}) {
    const { loadProposalsList: loadProposals, id } = this.props;
    loadProposals({
      state: 'active',
      workTeamId: id,
      after,
    });
  }

  render() {
    const { showRequest, joining, currentRequest } = this.state;
    if (!this.canAccess()) {
      return <div>ACCESS DENIED</div>;
    }
    const {
      workTeamUpdates = {},
      requestUpdates = {},
      discussionUpdates = {},
      workTeam = {},
      pageInfo,
      proposals = [],
      id,
      createMessage: notify,
      messageUpdates: messageStatus,
      wtProposals,
      updateProposal: mutateProposal,
    } = this.props;

    let content;
    if (showRequest) {
      const updates = joining ? workTeamUpdates : requestUpdates;
      content = (
        <Request
          onAllow={this.onAllowRequest}
          onDeny={this.onDenyRequest}
          onCancel={this.onCancel}
          {...currentRequest}
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
          noRequestsFound="No requests found"
          checkedIndices={[]}
          requests={workTeam.requests || []}
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
          onActive={this.handleLoadProposals}
        >
          <ListView
            onRetry={this.handleLoadProposals}
            onLoadMore={this.handleLoadMore}
            pageInfo={pageInfo}
          >
            {proposals.map(
              s =>
                s && (
                  <ProposalPreview
                    proposal={s}
                    onClick={this.onProposalClick}
                  />
                ),
            )}
          </ListView>
        </AccordionPanel>,
        <AccordionPanel
          heading="State of Proposals"
          onActive={this.fetchProposalStatus}
        >
          <AssetsTable
            onClickCheckbox={this.onClickCheckbox}
            onClickMenu={this.onProposalClick}
            allowMultiSelect
            searchTerm=""
            noRequestsFound="No requests found"
            checkedIndices={[]}
            assets={
              workTeam.linkedProposals.filter(
                lP => lP.proposal.state === 'accepted',
              ) || []
            }
            row={ProposalStatusRow}
            tableHeaders={['title', 'lastPoll', 'state', 'closed at']}
          />
        </AccordionPanel>,
      ];
    }
    return (
      <Box column>
        {/* eslint-disable-next-line */}
        <WorkteamHeader
          id={workTeam.id}
          displayName={workTeam.displayName}
          logo={workTeam.logo}
        />
        <Tabs>
          <Tab title={<FormattedMessage {...messages.discussions} />}>
            <Accordion>
              <AccordionPanel
                heading={<FormattedMessage {...messages.createDiscussion} />}
              >
                <DiscussionInput workTeamId={id} updates={discussionUpdates} />
              </AccordionPanel>
            </Accordion>
          </Tab>
          <Tab title={<FormattedMessage {...messages.proposals} />}>
            <Accordion>
              <AccordionPanel
                heading={<FormattedMessage {...messages.proposalInput} />}
                onActive={this.fetchTags}
              >
                <ProposalInput
                  workTeamId={id}
                  maxTags={8}
                  pollOptions={pollOptions}
                  defaultPollValues={defaultPollValues}
                />
              </AccordionPanel>
              <AccordionPanel
                heading={<FormattedMessage {...messages.proposalManager} />}
                onActive={this.fetchWTProposals}
              >
                <ProposalsManager
                  proposals={wtProposals || []}
                  workTeamId={id}
                  pollOptions={pollOptions}
                  defaultPollValues={defaultPollValues}
                  updateProposal={mutateProposal}
                  pageInfo={pageInfo}
                  loadProposals={this.fetchWTProposals}
                />
              </AccordionPanel>
              {mainTeamView}
            </Accordion>
          </Tab>
          <Tab title={<FormattedMessage {...messages.requests} />}>
            {content}
          </Tab>
          <Tab title={<FormattedMessage {...messages.messages} />}>
            <MessageInput
              messageType="NOTE"
              recipients={[id]}
              recipientType="GROUP"
              notifyUser={notify}
              updates={messageStatus}
            />
          </Tab>
        </Tabs>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  requests: getVisibleRequests(state, 'all'),
  discussionUpdates: getDiscussionUpdates(state),
  requestUpdates: getRequestUpdates(state),
  workTeamUpdates: getWorkTeamStatus(state),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'pending', workteamId: id }),
  ), // getProposalsPage(state, 'pending'),
  proposals: getVisibleProposals(state, 'pending'),
  messageUpdates: getMessageUpdates(state),
  wtProposals: getWTProposalsByState(state, id, 'active'),
});

const mapDispatch = {
  deleteRequest,
  joinWorkTeam,
  updateRequest,
  findUser,
  loadTags,
  loadProposalsList,
  loadProposalStatus,
  createMessage,
  updateProposal,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(WorkTeamManagement);
