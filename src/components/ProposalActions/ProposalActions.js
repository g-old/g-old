// @flow
import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
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
    this.state = {
      error: false,
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

  renderPollState() {
    const { proposal } = this.props;
    const result = [];
    if (proposal.state === 'survey') {
      result.push(<Label>Survey</Label>);
    } else {
      result.push(<Label>Poll One</Label>);
    }
    const { pollOne } = proposal;
    if (pollOne) {
      result.push(
        <div>
          <PollState
            compact
            allVoters={pollOne.allVoters}
            upvotes={pollOne.options[0].numVotes}
            downvotes={pollOne.options[1] && pollOne.options[1].numVotes}
            thresholdRef={pollOne.mode.thresholdRef}
            threshold={pollOne.threshold}
            unipolar={pollOne.mode.unipolar}
          />
        </div>,
      );
    }

    return result;
  }

  renderActions() {
    const {
      defaultPollSettings,
      updates = {},
      pollOptions,
      proposal: { pollOne, state, id, workTeamId },
      updateProposal,
      availablePolls,
      user,
    } = this.props;
    const actions = [];
    if (!pollOne.closedAt) {
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

    if (state !== 'survey') {
      actions.push(
        <AccordionPanel heading={<FormattedMessage {...messages.open} />}>
          <Box column pad>
            <PhaseTwoWizard
              workTeamId={workTeamId}
              proposalId={id}
              pollOptions={pollOptions}
              defaultPollSettings={defaultPollSettings}
              availablePolls={availablePolls}
              defaultPollType="voting"
              user={user}
              onUpdate={updateProposal}
            />
          </Box>
        </AccordionPanel>,
      );
    }

    return actions.length ? <Accordion>{actions}</Accordion> : [];
  }

  renderNotifications() {
    const {
      proposal: { state, pollOne },
    } = this.props;
    let result;
    if (
      state !== 'survey' &&
      (pollOne.closedAt || isThresholdPassed(pollOne))
    ) {
      result = <Notification type="alert" message="Ready for voting" />;
    }
    return result;
  }

  renderDetails() {
    const {
      proposal: { pollOne, state },
    } = this.props;
    const details = [
      <KeyValueRow name="Upvotes" value={pollOne.options[0].numVotes} />,
    ];

    if (state === 'survey') {
      details.push(
        <KeyValueRow name="Downvotes" value={pollOne.options[1].numVotes} />,
      );
    } else {
      const numVotersForThreshold = Math.ceil(
        (pollOne.allVoters * pollOne.threshold) / 100,
      );
      if (pollOne.options[0]) {
        details.push(
          <KeyValueRow
            name="Threshold (votes)"
            value={numVotersForThreshold}
          />,
          <KeyValueRow
            name="Votes left for threshold"
            value={numVotersForThreshold - pollOne.options[0].numVotes}
          />,
        );
      }
    }
    if (!pollOne.closedAt) {
      details.push(
        <KeyValueRow
          name="Endtime"
          value={
            <FormattedDate
              value={pollOne.endTime}
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
    const { error } = this.state;

    return (
      <Box column fill className={s.root}>
        <Box pad>
          <Heading tag="h3">{proposal.title}</Heading>
        </Box>
        <Box flex align justify wrap>
          <Box column>
            {error && <Notification type="error" message={errorMessage} />}
            {this.renderPollState()}
            {this.renderDetails()}
            {this.renderNotifications()}
          </Box>
          {this.renderActions()}
        </Box>
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
