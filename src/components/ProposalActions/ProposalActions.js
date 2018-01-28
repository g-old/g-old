import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import s from './ProposalActions.css';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
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
    id: 'manager.close',
    defaultMessage: 'Close proposal',
    description: 'Close the proposal',
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
    proposal: PropTypes.shape({ id: PropTypes.string }).isRequired,
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
    if (success === true) {
      this.props.onFinish();
    }
    if (error) {
      this.setState({ error: !this.props.error });
    }
  }
  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }
  handleBlur(e) {
    const field = e.target.name;
    if (this.state.settings[field]) {
      this.handleValidation([field]);
    }
  }
  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
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
        value = e.target.value;
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
    this.setState({
      settings: { ...this.state.settings, [e.target.name]: value },
    });
  }

  handleStateChange() {
    this.props.updateProposal({ id: this.props.proposal.id, state: 'revoked' });
  }

  handleOnSubmit() {
    // TODO sanitize input
    // TODO refactor - is the same as in ProposalsInput

    if (this.handleValidation(formFields)) {
      const startTime = null;
      let endTime = null;
      const { dateTo, timeTo, pollOption } = this.state.settings;
      // currently not in use
      /*  if (dateFrom || timeFrom) {
        dateFrom = dateFrom || new Date();
        timeFrom = timeFrom || utcCorrectedDate().slice(11, 16);
        startTime = concatDateAndTime(dateFrom, timeFrom);
      }
      */
      if (dateTo || timeTo) {
        const date = dateTo || utcCorrectedDate(3).slice(0, 10);
        const time = timeTo || utcCorrectedDate().slice(11, 16);

        endTime = concatDateAndTime(date, time);
      }
      const {
        withStatements,
        secret,
        threshold,
        thresholdRef,
        unipolar,
      } = this.state.settings;
      this.props.updateProposal({
        id: this.props.proposal.id,
        poll: {
          startTime,
          endTime,
          secret,
          threshold:
            threshold ||
            this.props.defaultPollValues[pollOption.value].threshold,
          mode: {
            withStatements,
            id: pollOption.value,
            unipolar,
            thresholdRef,
          },
        },
      });
    }
  }
  toggleSettings() {
    this.setState({ displaySettings: !this.state.displaySettings });
  }

  render() {
    const settings = this.state.settings;
    const { error, pending, proposal } = this.props;
    const pollOne = proposal.pollOne;
    const thresholdPassed = isThresholdPassed(pollOne);
    const numVotersForThreshold = Math.ceil(
      pollOne.allVoters * pollOne.threshold / 100,
    );
    return (
      <Box className={s.root} flex wrap>
        <Box flex column pad className={s.proposal}>
          {this.state.error && <Notification type="error" message={error} />}
          <Label>{proposal.title}</Label>
          <Label>{'Poll One'}</Label>
          {pollOne && (
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
            </div>
          )}
          <span>
            {'Upvotes:'} {pollOne.upvotes}
          </span>
          <span>
            {'Threshold (votes): '}
            {numVotersForThreshold}
          </span>
          {!thresholdPassed && (
            <span>
              {'Votes left for threshold: '}{' '}
              {numVotersForThreshold - pollOne.upvotes}
            </span>
          )}
          {!pollOne.closedAt && (
            <span>
              {'Endtime: '}
              {<FormattedRelative value={pollOne.endTime} />}
            </span>
          )}
          {(pollOne.closedAt || thresholdPassed) && (
            <Notification type="alert" message="Ready for voting" />
          )}
        </Box>
        <Box flex className={s.details}>
          <Accordion>
            <AccordionPanel heading={<FormattedMessage {...messages.revoke} />}>
              <Box pad column justify>
                <Button
                  disabled={pending}
                  onClick={this.handleStateChange}
                  primary
                  label={<FormattedMessage {...messages.revokeShort} />}
                />
              </Box>
            </AccordionPanel>
            <AccordionPanel heading={<FormattedMessage {...messages.open} />}>
              <Box column pad>
                <PollInput
                  onValueChange={this.handleValueChanges}
                  handleDateChange={this.handleValueChanges}
                  selectedPMode={this.state.settings.pollOption}
                  displaySettings={this.state.displaySettings}
                  defaultPollValues={this.props.defaultPollValues}
                  pollValues={settings}
                  toggleSettings={this.toggleSettings}
                  pollOptions={this.props.pollOptions}
                  intl={this.props.intl}
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
            </AccordionPanel>
          </Accordion>
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
