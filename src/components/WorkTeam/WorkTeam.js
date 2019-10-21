import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './WorkTeam.css';
import Heading from '../Heading';
import Value from '../Value';
// import Menu from '../Menu';
import ConfirmLayer from '../ConfirmLayer';
import Box from '../Box';
import Button from '../Button';
import history from '../../history';
import Tabs from '../Tabs';
import Tab from '../Tab';
import { ICONS } from '../../constants';
import { Groups } from '../../organization';
import Link from '../Link';
import UserThumbnail from '../UserThumbnail';
import DiscussionListContainer from '../DiscussionListContainer';
import ProposalListContainer from '../ProposalListContainer';
// import SurveyListContainer from '../SurveyListContainer';
import StateFilter from '../StateFilter';
import Notification from '../Notification';
import Image from '../Image/Image';

const Discussion = lazy(() =>
  import('../../routes/discussion/DiscussionContainer'),
);

const Proposal = lazy(() => import('../../routes/proposal/ProposalContainer'));

const messages = defineMessages({
  join: {
    id: 'join',
    defaultMessage: 'Join',
    description: 'Button label',
  },
  withdraw: {
    id: 'join.withdraw',
    defaultMessage: 'Dismiss request',
    description: 'Cancel join request',
  },
  leave: {
    id: 'leave',
    defaultMessage: 'Leave',
    description: 'Leave team',
  },
  proposals: {
    id: 'proposals',
    defaultMessage: 'Proposals',
    description: 'Proposals label',
  },
  discussions: {
    id: 'discussions',
    defaultMessage: 'Discussions',
    description: 'Discussions label',
  },
  members: {
    id: 'members',
    defaultMessage: 'Members',
    description: 'Members label',
  },
  coordinator: {
    id: 'coordinator',
    defaultMessage: 'Coordinator',
    description: 'Label coordinator',
  },
  surveys: {
    id: 'surveys',
    description: 'Surveys label',
    defaultMessage: 'Surveys',
  },
});

const isPrivileged = (user, coordinator, mainTeam, id) =>
  user.id == coordinator.id || // eslint-disable-line eqeqeq
  user.groups & Groups.ADMIN || // eslint-disable-line no-bitwise
  (mainTeam && user.wtMemberships.includes(Number(id)));

class WorkTeam extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    logo: PropTypes.string,
    coordinator: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    displayName: PropTypes.string.isRequired,
    numMembers: PropTypes.number.isRequired,
    numDiscussions: PropTypes.number.isRequired,
    numProposals: PropTypes.number.isRequired,
    discussions: PropTypes.arrayOf(PropTypes.shape({})),
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    mainTeam: PropTypes.bool,
    deletedAt: PropTypes.string,
    ownStatus: PropTypes.shape({
      status: PropTypes.oneOf(['NONE', 'MEMBER', 'PENDING']),
    }).isRequired,
    onJoinRequest: PropTypes.func.isRequired,
    updates: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
    restricted: PropTypes.bool.isRequired,
    onJoin: PropTypes.func.isRequired,
    onLeave: PropTypes.func.isRequired,
    onDeleteRequest: PropTypes.func.isRequired,
    onLoadDiscussions: PropTypes.func.isRequired,
    onLoadProposals: PropTypes.func.isRequired,
    image: PropTypes.string,
    small: PropTypes.bool,
  };

  static defaultProps = {
    logo: null,
    discussions: null,
    proposals: null,
    mainTeam: null,
    deletedAt: null,
    image: null,
    small: null,
  };

  constructor(props) {
    super(props);
    this.handleDiscussionClick = this.handleDiscussionClick.bind(this);
    this.handleJoining = this.handleJoining.bind(this);
    this.cancelJoining = this.cancelJoining.bind(this);
    this.renderActionButton = this.renderActionButton.bind(this);
    this.onOpenLayer = this.onOpenLayer.bind(this);
    this.onCloseLayer = this.onCloseLayer.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.handleDiscussionFilterChange = this.handleDiscussionFilterChange.bind(
      this,
    );
    this.handleProposalFilterChange = this.handleProposalFilterChange.bind(
      this,
    );
    this.handleSurveyFilterChange = this.handleSurveyFilterChange.bind(this);
    this.handleLoadMoreDiscussions = this.handleLoadMoreDiscussions.bind(this);
    this.handleLoadMoreProposals = this.handleLoadMoreProposals.bind(this);
    this.handleLoadMoreSurveys = this.handleLoadMoreSurveys.bind(this);
    this.fetchDiscussions = this.fetchDiscussions.bind(this);
    this.fetchProposals = this.fetchProposals.bind(this);
    this.handleProposalClick = this.handleProposalClick.bind(this);

    this.state = {
      showLayer: false,
      activeTabIndex: 1,
      discussionStatus: 'active',
      proposalStatus: 'active',
      // surveyStatus: 'active',
      currentContainer: null,
    };
    this.activateTab = this.activateTab.bind(this);
  }

  onOpenLayer() {
    this.setState({ showLayer: true });
  }

  onCloseLayer() {
    this.setState({ showLayer: false });
  }

  onLeave(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { ownStatus = {}, id, onLeave } = this.props;
    if (ownStatus !== 'NONE') {
      onLeave({ id }).then(() => this.onCloseLayer());
    }
  }

  handleDiscussionClick({ discussionId }) {
    const { id, small } = this.props;
    if (small) {
      history.push(`${id}/discussions/${discussionId}`);
    } else {
      this.setState({
        currentContainer: { type: 'discussion', args: { id: discussionId } },
      });
    }
  }

  handleProposalClick({ proposalId, pollId }) {
    const { id, small } = this.props;
    if (small) {
      history.push(`/proposal/${proposalId}/${pollId}`);
    } else {
      this.setState({
        currentContainer: {
          type: 'proposal',
          args: { proposalId, pollId },
        },
      });
    }
  }

  handleLoadMoreDiscussions({ after }) {
    const { discussionStatus } = this.state;
    const { id, onLoadDiscussions } = this.props;
    onLoadDiscussions({
      closed: discussionStatus === 'closed',
      workteamId: id,
      after,
    });
  }

  handleLoadMoreProposals({ after }) {
    const { proposalStatus } = this.state;
    const { id, onLoadProposals } = this.props;
    onLoadProposals({
      state: proposalStatus,
      workteamId: id,
      after,
    });
  }

  handleLoadMoreSurveys({ after }) {
    const { surveyStatus } = this.state;
    const { id, onLoadProposals } = this.props;
    onLoadProposals({
      state: 'survey',
      closed: surveyStatus === 'closed',
      workteamId: id,
      after,
    });
  }

  handleJoining() {
    const { ownStatus = {}, id, onJoin } = this.props;
    if (ownStatus.status === 'NONE') {
      onJoin({ id });
    }
  }

  handleDiscussionFilterChange(e) {
    const { discussionStatus } = this.state;
    if (e.option.value !== discussionStatus) {
      this.setState(
        { discussionStatus: e.option.value },
        this.fetchDiscussions,
      );
    }
  }

  handleProposalFilterChange(e) {
    const { proposalStatus } = this.state;

    if (e.option.value !== proposalStatus) {
      this.setState({ proposalStatus: e.option.value }, this.fetchProposals);
    }
  }

  handleSurveyFilterChange(e) {
    const { surveyStatus } = this.state;

    if (e.option.value !== surveyStatus) {
      this.setState({ surveyStatus: e.option.value }, this.fetchSurveys);
    }
  }

  fetchDiscussions() {
    const { onLoadDiscussions, id } = this.props;
    const { discussionStatus } = this.state;

    onLoadDiscussions({
      workteamId: id,
      closed: discussionStatus !== 'active',
    });
  }

  fetchProposals() {
    const { onLoadProposals, id } = this.props;
    const { proposalStatus } = this.state;

    onLoadProposals({
      workteamId: id,
      state: proposalStatus,
    });
  }

  fetchSurveys() {
    const { onLoadProposals, id } = this.props;
    const { surveyStatus } = this.state;
    onLoadProposals({
      workteamId: id,
      state: 'survey',
      closed: surveyStatus === 'closed',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  cancelJoining() {
    const { ownStatus = {} } = this.props;
    if (ownStatus.status !== 'NONE') {
      this.onOpenLayer();
      // this.props.onLeave({ id });
    }
  }

  activateTab(index) {
    this.setState({ activeTabIndex: index });
  }

  renderActionButton(status, updates) {
    let label;
    let action;
    const props = {};
    switch (status) {
      case 'NONE': {
        label = 'join';
        props.primary = true;
        action = this.handleJoining;
        break;
      }
      case 'PENDING': {
        label = 'withdraw';
        action = this.cancelJoining;
        break;
      }
      case 'MEMBER': {
        label = 'leave';
        action = this.cancelJoining;
        break;
      }

      default: {
        console.error(`Status not recognized: ${status}`);
      }
    }

    return (
      <Button
        disabled={updates.pending}
        onClick={action}
        {...props}
        label={<FormattedMessage {...messages[label]} />}
      />
    );
  }

  render() {
    const {
      displayName,
      numMembers,
      numDiscussions,
      numProposals,
      ownStatus = {},
      updates = {},
      user,
      coordinator,
      id,
      mainTeam,
      deletedAt,
      image,
      small,
    } = this.props;
    const {
      discussionStatus,
      proposalStatus,
      surveyStatus,
      activeTabIndex,
      showLayer,
      currentContainer,
    } = this.state;
    let picture;
    if (image) {
      picture = (
        <Image className={s.image} fit src={`/s720/${image}`} />
      ); /* <img alt="Logo" className={s.logo} src={logo} />; */
    } else {
      picture = (
        <svg
          className={s.logo}
          version="1.1"
          viewBox="0 0 24 24"
          role="img"
          width="100px"
          height="100px"
          aria-label="cloud"
        >
          <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.workteam} />
        </svg>
      );
    }

    let actionBtns;
    if (ownStatus.status && !deletedAt) {
      const controls = [];
      if (user.id != coordinator.id) {
        // a coordinator should not be able to leave
        controls.push(this.renderActionButton(ownStatus.status, updates));
      }

      if (isPrivileged(user, coordinator, mainTeam, id)) {
        controls.push(
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link to={`/workteams/${id}/admin`}>
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="settings"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d={ICONS.settings}
              />
            </svg>
          </Link>,
        );
      }
      actionBtns = (
        <Box padding="small" align>
          {controls}
        </Box>
      );
    }

    let contentSection;
    if (ownStatus.status === 'MEMBER' && !deletedAt) {
      contentSection = (
        <Box className={cn(s.container, s.big)} tag="section" column fill>
          <Tabs activeIndex={activeTabIndex} onActive={this.activateTab}>
            <Tab title={<FormattedMessage {...messages.proposals} />}>
              <StateFilter
                states={['active', 'accepted', 'repelled']}
                filter={proposalStatus}
                onChange={this.handleProposalFilterChange}
              />
              <ProposalListContainer
                id={id}
                status={proposalStatus}
                onLoadMore={this.handleLoadMoreProposals}
                onItemClick={this.handleProposalClick}
                onRetry={this.fetchProposals}
              />
            </Tab>
            <Tab title={<FormattedMessage {...messages.discussions} />}>
              <StateFilter
                states={['active', 'closed']}
                filter={discussionStatus}
                onChange={this.handleDiscussionFilterChange}
              />
              <DiscussionListContainer
                id={id}
                status={discussionStatus}
                onLoadMore={this.handleLoadMoreDiscussions}
                onItemClick={this.handleDiscussionClick}
                onRetry={this.fetchDiscussions}
              />
            </Tab>
            {/* <Tab title={<FormattedMessage {...messages.surveys} />}>
              <StateFilter
                states={['active', 'closed']}
                filter={surveyStatus}
                onChange={this.handleSurveyFilterChange}
              />
              <SurveyListContainer
                id={id}
                status={surveyStatus}
                onLoadMore={this.handleLoadMoreSurveys}
                onItemClick={WorkTeam.onProposalClick}
                onRetry={this.fetchSurveys}
              />
      </Tab> */}
          </Tabs>
        </Box>
      );
    }
    let layer;
    if (showLayer) {
      layer = (
        <ConfirmLayer
          onClose={this.onCloseLayer}
          onSubmit={this.onLeave}
          action="leave"
        />
      );
    }
    if (deletedAt) {
      return (
        <Box align column padding="medium" pad fill>
          {picture}
          <Heading tag="h2">{displayName}</Heading>
          <Box>
            <UserThumbnail
              marked
              label={<FormattedMessage {...messages.coordinator} />}
              user={coordinator}
            />
          </Box>
          <Notification type="alert" message="Workteam inactive" />
        </Box>
      );
    }
    return (
      <Box wrap={small} column={small} between fill>
        <Box className={cn(s.container, small && s.big)} justify align column>
          <Box align column>
            {picture}
            <Heading tag="h2">{displayName}</Heading>
            <Box column align>
              <FormattedMessage {...messages.coordinator} />
              <Box align>
                <svg viewBox="0 0 24 24" width="24px" height="24px">
                  <path fill="#222" d={ICONS.coordinator} />
                </svg>
                <UserThumbnail big marked user={coordinator} />
              </Box>
            </Box>
            <Box wrap>
              <Value
                onClick={() => {
                  history.push(`/workteams/${id}/members`);
                }}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                    />
                  </svg>
                }
                label={<FormattedMessage {...messages.members} />}
                value={numMembers || 0}
              />
              <Value
                onClick={() => this.activateTab(0)}
                icon={
                  <svg
                    version="1.1"
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                    aria-label="proposal"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M16,7 L19,7 L19,11 L16,11 L16,7 Z M9,15 L20,15 M9,11 L13,11 M9,7 L13,7 M6,18.5 C6,19.8807119 4.88071187,21 3.5,21 C2.11928813,21 1,19.8807119 1,18.5 L1,7 L6.02493781,7 M6,18.5 L6,3 L23,3 L23,18.5 C23,19.8807119 21.8807119,21 20.5,21 L3.5,21"
                    />
                  </svg>
                }
                label={<FormattedMessage {...messages.proposals} />}
                value={numProposals || 0}
              />
              <Value
                onClick={() => this.activateTab(1)}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d={ICONS.document}
                    />
                  </svg>
                }
                label={<FormattedMessage {...messages.discussions} />}
                value={numDiscussions || 0}
              />
            </Box>
            {actionBtns}
          </Box>
          {layer}
        </Box>
        <Box className={s.row} column>
          {contentSection}
          {currentContainer && (
            <Box className={cn(s.container, s.big)}>
              <Suspense fallback={<div> Loading content ....</div>}>
                {currentContainer.type === 'discussion' && (
                  <Discussion
                    sideLoading
                    id={currentContainer.args.id}
                    user={user}
                  />
                )}
                {currentContainer.type === 'proposal' && (
                  <Proposal
                    sideLoading
                    {...currentContainer.args}
                    user={user}
                  />
                )}
              </Suspense>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(WorkTeam);
