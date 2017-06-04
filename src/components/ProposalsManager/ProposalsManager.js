import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedRelative, defineMessages, FormattedMessage } from 'react-intl';
import {
  getVisibleProposals,
  getProposalsIsFetching,
  getProposalsErrorMessage,
} from '../../reducers';
import { updateProposal, loadProposalsList } from '../../actions/proposal';
import PollInput from '../PollInput';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import PollState from '../PollState';
import Button from '../Button';
import FetchError from '../FetchError';
import Box from '../Box';

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
    id: 'manager.clsoe',
    defaultMessage: 'Close proposal',
    description: 'Close the proposal',
  },
});

const ConfirmationDialog = props =>
  (<div>
    <p><FormattedMessage {...messages.confirmation} /></p>
    <Box>
      <Button primary onClick={props.onAction} label={props.label} />
      <Button onClick={props.onCancel} label={<FormattedMessage {...messages.cancel} />} />
    </Box>
  </div>);

ConfirmationDialog.propTypes = {
  onAction: PropTypes.func.isRequired,
  label: PropTypes.element.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const ProposalInfo = props =>
  (<div>
    <h3>{props.title}</h3>
    <PollState
      compact
      allVoters={props.poll.allVoters}
      upvotes={props.poll.upvotes}
      downvotes={props.poll.downvotes}
      thresholdRef={props.poll.mode.thresholdRef}
      threshold={props.poll.threshold}
      unipolar={props.poll.mode.unipolar}
    />

    {props.children}

  </div>);

ProposalInfo.propTypes = {
  title: PropTypes.string.isRequired,
  poll: PropTypes.shape({
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number.isRequired,
    allVoters: PropTypes.number.isRequired,
    mode: PropTypes.shape({
      thresholdRef: PropTypes.string,
      unipolar: PropTypes.bool,
    }),
    threshold: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.element.isRequired,
};

class ProposalsManager extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    updateProposal: PropTypes.func.isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };
  static defaultProps = {
    errorMessage: null,
  };
  constructor(props) {
    super(props);
    this.state = { settings: { pollOption: '2' } };
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
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
    const { proposals, isFetching, errorMessage } = this.props;
    if (isFetching && !proposals.length) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !proposals.length) {
      return (
        <FetchError message={errorMessage} onRetry={() => this.props.loadProposalsList('active')} />
      );
    }
    const toRender = proposals.filter(p => p.state === 'proposed');
    toRender.sort((a, b) => new Date(a.pollOne.end_time) - new Date(b.pollOne.end_time));
    const settings = this.state.settings;
    let content = null;
    switch (this.state.action) {
      case 'voting': {
        content = (
          <div>
            <PollInput
              onValueChange={this.handleValueChanges}
              handleDateChange={this.handleValueChanges}
              selectedPMode={this.state.settings.pollOption}
              displaySettings={this.state.displaySettings}
              defaultPollValues={this.props.defaultPollValues}
              pollValues={settings}
              toggleSettings={this.toggleSettings}
              pollOptions={this.props.pollOptions}
              intl={this.context.intl}
            />
            <Button
              label={<FormattedMessage {...messages.open} />}
              primary
              onClick={this.handleOnSubmit}
            />
            {/* <button onClick={this.handleOnSubmit}>START PHASE 2 </button>{' '}*/}
          </div>
        );
        break;
      }

      case 'revoked': {
        content = (
          <ConfirmationDialog
            onAction={this.handleStateChange}
            onCancel={() => this.setState({ currentProposal: null })}
            label={<FormattedMessage {...messages.revoke} />}
          />
        );
        break;
      }

      case 'accepted': {
        content = (
          <ConfirmationDialog
            onAction={this.handleStateChange}
            onCancel={() => this.setState({ currentProposal: null })}
            label={<FormattedMessage {...messages.close} />}
          />
        );
        break;
      }
      default:
        content = 'No valid state';
    }

    return (
      <div>
        {toRender.map(
          p =>
            p.state === 'proposed' &&
            <ProposalInfo title={p.title} poll={p.pollOne}>
              STATE {p.state} <br />
              ENDTIME <FormattedRelative value={p.pollOne.end_time} /> <br />

              <Box>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ currentProposal: p.id, action: 'revoked' });
                  }}
                  label={<FormattedMessage {...messages.revokeShort} />}
                  accent
                />

                {
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ currentProposal: p.id, action: 'accepted' });
                    }}
                    label={<FormattedMessage {...messages.close} />}
                    accent
                  />
                }

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({
                      currentProposal: p.id,
                      action: 'voting',
                    });
                  }}
                  label={<FormattedMessage {...messages.open} />}
                  accent
                />
              </Box>
              {p.id === this.state.currentProposal && content}
            </ProposalInfo>,
        )}
      </div>
    );
  }
}

const mapPropsToState = state => ({
  proposals: getVisibleProposals(state, 'active'),
  isFetching: getProposalsIsFetching(state, 'active'),
  errorMessage: getProposalsErrorMessage(state, 'active'),
});
const mapDispatch = {
  updateProposal,
  loadProposalsList,
};
ProposalsManager.contextTypes = {
  intl: PropTypes.object,
};
export default connect(mapPropsToState, mapDispatch)(ProposalsManager);
