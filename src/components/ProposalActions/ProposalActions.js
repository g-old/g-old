// @flow
import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import s from './ProposalActions.css';
import KeyValueRow from './KeyValueRow';
import {
  getProposal,
  getProposalUpdates,
  getSessionUser,
} from '../../reducers';
import Box from '../Box';
import Button from '../Button';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import Notification from '../Notification';
import Label from '../Label';
import PollState from '../PollState';
import Heading from '../Heading';
import PhaseTwoWizard from './PhaseTwoWizard';
import type { PollTypeTypes, PollSettingsShape } from '../ProposalInput';
import withPollSettings from '../ProposalInput/withPollSettings';
import ApprovalProcess from '../ApprovalProcess';
import Tabs from '../Tabs';
import Tab from '../Tab';

const WizardWithSettings = withPollSettings(PhaseTwoWizard, ['voting']);
const messages = defineMessages({
  confirmation: {
    id: 'confirmation',
    defaultMessage: 'Are you sure?',
    description: 'Ask for confirmation',
  },

  open: {
    id: 'manager.open',
    defaultMessage: 'Open voting',
    description: 'Starts the voting process',
  },
  revokeShort: {
    id: 'manager.revokeShort',
    defaultMessage: 'Revoke',
    description: 'Revoke proposal, short',
  },
  revoke: {
    id: 'manager.revoke',
    defaultMessage: 'Revoke proposal',
    description: 'Revoke proposal',
  },
  close: {
    id: 'command.close',
    defaultMessage: 'Close',
    description: 'Close',
  },
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  past: {
    id: 'form.error-past',
    defaultMessage: 'Time already passed',
    description: 'Help for wrong time settings',
  },
  approve: {
    id: 'command.approve',
    defaultMessage: 'Bestätigen',
    description: 'Command for proposal verification',
  },
  reject: {
    id: 'command.reject',
    defaultMessage: 'Reject',
    description: 'Command for proposal rejection',
  },
});

const isThresholdPassed = poll => {
  let ref;
  if (poll.extended) {
    return false;
  }
  const tRef = poll.mode.thresholdRef;
  const upvotes = poll.options[0].numVotes;
  const downvotes = poll.options[1] ? poll.options[1].numVotes : 0;
  switch (tRef) {
    case 'voters':
      ref = upvotes + downvotes;
      break;
    case 'all':
      ref = poll.allVoters;
      break;

    default:
      throw Error(
        `Threshold reference not implemented: ${tRef || 'undefined'}`,
      );
  }
  ref *= poll.threshold / 100;
  return upvotes ? upvotes >= ref : false;
};
type Props = {
  updateProposal: () => Promise<boolean>,
  pollOptions: PollTypeTypes[],
  updates: {
    isFetching: boolean,
    errorMessage?: string,
    success: boolean,
  },
  onFinish: () => void,
  proposal: ProposalShape,
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: PollTypeTypes[],
  user: UserShape,
};

type State = {
  error: boolean,
};
class ProposalActions extends React.Component<Props, State> {
  static defaultProps = {
    error: null,
    pending: false,
    success: false,
  };

  constructor(props) {
    super(props);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleApproval = this.handleApproval.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.state = {
      error: false,
      open: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { updates, onFinish } = this.props;
    if (prevProps.updates !== updates) {
      if (updates.success) {
        onFinish();
      } else if (updates.errorMessage) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ error: !!updates.errorMessage });
      }
    }
  }

  handleStateChange: () => void;

  handleStateChange() {
    const {
      proposal: { id, workTeamId, state },
      updateProposal,
    } = this.props;

    updateProposal({
      id,
      state: state === 'survey' ? 'survey' : 'revoked',
      ...(workTeamId && {
        workTeamId,
      }),
    });
  }

  handleApproval(values) {
    const {
      proposal: { id },
      updateProposal,
    } = this.props;
    let approvalState = values.reduce((approval, current) => {
      approval |= current.value;
      return approval;
    }, 0);

    updateProposal({
      id,
      approvalState,
    });
  }

  toggleLayer() {
    return this.setState(prevState => ({ open: !prevState.open }));
  }

  renderPollState() {
    const {
      proposal: { state, pollOne, pollTwo },
    } = this.props;
    const result = [];
    if (state === 'survey') {
      result.push(<Label>Survey</Label>);
    } else {
      result.push(<Label>{pollTwo ? 'VOTING' : 'PROPOSAL'}</Label>);
    }
    const poll = pollTwo || pollOne;
    if (poll) {
      result.push(
        <div>
          <PollState
            compact
            allVoters={poll.allVoters}
            upvotes={poll.options[0].numVotes}
            downvotes={poll.options[1] && poll.options[1].numVotes}
            thresholdRef={poll.mode.thresholdRef}
            threshold={poll.threshold}
            unipolar={poll.mode.unipolar}
          />
        </div>,
      );
    }

    return result;
  }

  renderActions() {
    const {
      updates = {},
      proposal: { pollOne, pollTwo, state, id, workTeamId },
      updateProposal,
      user,
    } = this.props;
    const poll = pollTwo || pollOne;
    const actions = [];
    if (!poll.closedAt) {
      actions.push(
        <AccordionPanel
          heading={
            <FormattedMessage
              {...messages[state === 'survey' ? 'close' : 'revoke']}
            />
          }
        >
          <Box pad column justify>
            <Button
              disabled={updates.isFetching}
              onClick={this.handleStateChange}
              primary
              label={
                <FormattedMessage
                  {...messages[state === 'survey' ? 'close' : 'revokeShort']}
                />
              }
            />
          </Box>
        </AccordionPanel>,
      );
    }

    if (state === 'proposed') {
      actions.push(
        <AccordionPanel heading={<FormattedMessage {...messages.open} />}>
          <Box column>
            <WizardWithSettings
              workTeamId={workTeamId}
              proposalId={id}
              defaultPollType="voting"
              user={user}
              onUpdate={updateProposal}
            />
          </Box>
        </AccordionPanel>,
      );
    }
    actions.push(<Button onClick={this.toggleLayer}>Approval</Button>);

    return actions.length ? <Accordion>{actions}</Accordion> : [];
  }

  renderNotifications() {
    const {
      proposal: { state, pollOne },
    } = this.props;
    let result;
    if (
      pollOne &&
      state === 'proposed' &&
      (pollOne.closedAt || isThresholdPassed(pollOne))
    ) {
      result = <Notification type="alert" message="Ready for voting" />;
    }
    return result;
  }

  renderDetails() {
    const {
      proposal: { pollOne, state, pollTwo },
    } = this.props;
    const poll = pollTwo || pollOne;

    const details = [];

    poll.options.forEach(option => {
      details.push(
        <KeyValueRow
          name={option.title || option.description}
          value={option.numVotes}
        />,
      );
    });

    if (state === 'proposed') {
      const numVotersForThreshold = Math.ceil(
        (poll.allVoters * poll.threshold) / 100,
      );
      details.push(
        <KeyValueRow name="Threshold (votes)" value={numVotersForThreshold} />,
        <KeyValueRow
          name="Votes left for threshold"
          value={numVotersForThreshold - poll.options[0].numVotes}
        />,
      );
    }
    if (!poll.closedAt) {
      details.push(
        <KeyValueRow
          name="Endtime"
          value={
            <FormattedDate
              value={poll.endTime}
              day="numeric"
              month="numeric"
              year="numeric"
              hour="numeric"
              minute="numeric"
            />
          }
        />,
      );
    }

    return (
      <table className={s.keyValue}>
        <tbody>{details}</tbody>
      </table>
    );
  }

  render() {
    const {
      updates: { errorMessage },
      proposal,
    } = this.props;
    const { error, open } = this.state;
    if (open) {
      return <ApprovalProcess proposal={this.props.proposal} />;
    }

    return (
      <Box column fill className={s.root}>
        <Tabs>
          <Tab title="Overview">
            <Box pad>
              <Heading tag="h3">{proposal.title}</Heading>
            </Box>
            <Box flex align justify column fill>
              <Box column fill>
                {error && <Notification type="error" message={errorMessage} />}
                {this.renderPollState()}
                {this.renderDetails()}
                {this.renderNotifications()}
              </Box>
              {this.renderActions()}
            </Box>
          </Tab>
          <Tab title="Approvations">
            <ApprovalProcess
              proposal={this.props.proposal}
              onSubmit={this.handleApproval}
            />
          </Tab>
        </Tabs>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  updates: getProposalUpdates(state, id),
  proposal: getProposal(state, id),
  user: getSessionUser(state),
});

export default connect(mapStateToProps)(withStyles(s)(ProposalActions));
