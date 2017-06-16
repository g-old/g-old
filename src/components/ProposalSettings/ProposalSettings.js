import React from 'react';
import PropTypes from 'prop-types';

import { defineMessages, FormattedMessage } from 'react-intl';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';

import Layer from '../Layer';
import Box from '../Box';
import Button from '../Button';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import Label from '../Label';
import PollInput from '../PollInput';

const messages = defineMessages({
  cancel: {
    id: 'cancel',
    defaultMessage: 'cancel',
    description: 'Cancel the action',
  },
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
});
class ProposalSettings extends React.Component {
  static propTypes = {
    updateProposal: PropTypes.func.isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
    pollOptions: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
  };
  constructor(props) {
    super(props);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.state = {
      settings: { pollOption: '2' },
    };
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
    this.setState({ settings: { ...this.state.settings, [e.target.name]: value } });
  }

  handleStateChange() {
    const newState = this.state.action;
    this.props.updateProposal({ id: this.state.currentProposal, state: newState });
    this.setState({ currentProposal: null });
  }

  handleOnSubmit() {
    // TODO sanitize input
    // TODO refactor - is the same as in ProposalsInput
    let startTime = null;
    let endTime = null;
    let { dateFrom, timeFrom, dateTo, timeTo } = this.state.settings;
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
    const { withStatements, secret, threshold, thresholdRef, unipolar } = this.state.settings;
    const pollingModeId = this.state.settings.pollOption;
    this.props.updateProposal({
      id: this.state.currentProposal,
      poll: {
        startTime,
        endTime,
        secret,
        threshold: threshold || this.props.defaultPollValues[pollingModeId].threshold,
        mode: {
          withStatements,
          id: pollingModeId,
          unipolar,
          thresholdRef,
        },
      },
    });
  }
  toggleSettings() {
    this.setState({ displaySettings: !this.state.displaySettings });
  }
  render() {
    const settings = this.state.settings;

    return (
      <Layer>
        <Box pad column>

          <Accordion>
            <AccordionPanel heading={<FormattedMessage {...messages.revoke} />}>
              <Label>{'Are your sure ?'}</Label>
              <Box>
                <Button primary label={<FormattedMessage {...messages.revokeShort} />} />
                <Button label={<FormattedMessage {...messages.cancel} />} />
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
                />
                <Button
                  label={<FormattedMessage {...messages.open} />}
                  primary
                  onClick={this.handleOnSubmit}
                />
                {/* <button onClick={this.handleOnSubmit}>START PHASE 2 </button>{' '}*/}
              </Box>
            </AccordionPanel>
          </Accordion>
        </Box>
      </Layer>
    );
  }
}

export default ProposalSettings;
