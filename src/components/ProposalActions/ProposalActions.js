import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import s from './ProposalActions.css';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import KeyValueRow from './KeyValueRow';
import {
  getProposal,
  getIsProposalFetching,
  getProposalErrorMessage,
  getProposalSuccess,
} from '../../reducers';
import Box from '../Box';
import Button from '../Button';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import PollInput from '../PollInput';
import {
  createValidator,
  dateToValidation,
  timeToValidation,
} from '../../core/validation';
import Notification from '../Notification';
import Label from '../Label';
import PollState from '../PollState';
import Heading from '../Heading';

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

const formFields = ['dateTo', 'timeTo'];
const isThresholdPassed = poll => {
  let ref;
  const tRef = poll.mode.thresholdRef;
  switch (tRef) {
    case 'voters':
      ref = poll.upvotes + poll.downvotes;
      break;
    case 'all':
      ref = poll.allVoters;
      break;

    default:
      throw Error(`Threshold reference not implemented: ${tRef}`);
  }
  ref *= poll.threshold / 100;
  return poll.upvotes >= ref;
};
class ProposalActions extends React.Component {
  static propTypes = {
    updateProposal: PropTypes.func.isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
    pollOptions: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    onFinish: PropTypes.func.isRequired,
    error: PropTypes.shape({}),
    proposal: PropTypes.shape({
      id: PropTypes.string,
      workTeamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    pending: PropTypes.bool,
    success: PropTypes.bool,
  };

  static defaultProps = {
    error: null,
    pending: false,
    success: false,
  };

  constructor(props) {
    super(props);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.state = {
      settings: { pollOption: { value: '2' } },
      error: false,
      errors: {
        dateTo: {
          touched: false,
        },
        timeTo: {
          touched: false,
        },
      },
    };
    const testValues = {
      dateTo: { fn: 'date' },
      timeTo: { fn: 'time' },
    };
    this.Validator = createValidator(
      testValues,
      {
        date: dateToValidation,
        time: timeToValidation,
      },
      this,
      obj => obj.state.settings,
    );
  }

  componentWillReceiveProps({ success, error }) {
    const { onFinish, error: errorMessage } = this.props;
    if (success === true) {
      onFinish();
    }
    if (error) {
      this.setState({ error: !errorMessage });
    }
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState(prevState => ({
      errors: { ...prevState.errors, ...validated.errors },
    }));
    return validated.failed === 0;
  }

  handleBlur(e) {
    const field = e.target.name;
    const { settings } = this.state;
    if (settings[field]) {
      this.handleValidation([field]);
    }
  }

  visibleErrors(errorNames) {
    const { errors } = this.state;
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (errors[curr].touched) {
        acc[err] = <FormattedMessage {...messages[errors[curr].errorName]} />;
      }
      return acc;
    }, {});
  }

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
        value = e.target.checked;
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

  handleOnSubmit() {
    // TODO sanitize input
    // TODO refactor - is the same as in ProposalsInput

    if (this.handleValidation(formFields)) {
      const {
        settings: {
          dateTo,
          timeTo,
          pollOption,
          withStatements,
          secret,
          threshold,
          thresholdRef,
          unipolar,
        },
      } = this.state;
      const {
        updateProposal,
        proposal: { id, defaultPollValues, workTeamId },
      } = this.props;
      const startTime = null;
      let endTime = null;

      if (dateTo || timeTo) {
        const date = dateTo || utcCorrectedDate(3).slice(0, 10);
        const time = timeTo || utcCorrectedDate().slice(11, 16);

        endTime = concatDateAndTime(date, time);
      }

      updateProposal({
        id,
        poll: {
          startTime,
          endTime,
          secret,
          threshold: threshold || defaultPollValues[pollOption.value].threshold,
          mode: {
            withStatements,
            id: pollOption.value,
            unipolar,
            thresholdRef,
          },
        },
        ...(workTeamId && {
          workTeamId,
        }),
      });
    }
  }

  toggleSettings() {
    this.setState(prevState => ({
      displaySettings: !prevState.displaySettings,
    }));
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
            upvotes={pollOne.upvotes}
            downvotes={pollOne.downvotes}
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
      defaultPollValues,
      pending,
      pollOptions,
      intl,
      proposal: { pollOne, state },
    } = this.props;
    const { settings, displaySettings } = this.state;
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
              disabled={pending}
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
            <PollInput
              onValueChange={this.handleValueChanges}
              handleDateChange={this.handleValueChanges}
              selectedPMode={settings.pollOption}
              displaySettings={displaySettings}
              defaultPollValues={defaultPollValues}
              pollValues={settings}
              toggleSettings={this.toggleSettings}
              pollOptions={pollOptions}
              intl={intl}
              formErrors={this.visibleErrors(formFields)}
              handleBlur={this.handleBlur}
            />
            <Button
              disabled={pending}
              label={<FormattedMessage {...messages.open} />}
              primary
              onClick={this.handleOnSubmit}
            />
            {/* <button onClick={this.handleOnSubmit}>START PHASE 2 </button>{' '} */}
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
    const details = [<KeyValueRow name="Upvotes" value={pollOne.upvotes} />];

    if (state === 'survey') {
      details.push(<KeyValueRow name="Downvotes" value={pollOne.downvotes} />);
    } else {
      const numVotersForThreshold = Math.ceil(
        (pollOne.allVoters * pollOne.threshold) / 100,
      );
      details.push(
        <KeyValueRow name="Threshold (votes)" value={numVotersForThreshold} />,
        <KeyValueRow
          name="Votes left for threshold"
          value={numVotersForThreshold - pollOne.upvotes}
        />,
      );
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
    const { error: errorMessage, proposal } = this.props;
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
  success: getProposalSuccess(state, id),
  pending: getIsProposalFetching(state, id),
  error: getProposalErrorMessage(state, id),
  proposal: getProposal(state, id),
});

export default connect(mapStateToProps)(withStyles(s)(ProposalActions));
