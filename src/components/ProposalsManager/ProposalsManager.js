import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedRelative } from 'react-intl';
import { getVisibleProposals } from '../../reducers';
import { loadProposalsList, updateProposal } from '../../actions/proposal';
import PollInput from '../PollInput';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import PollState from '../PollState';

const ConfirmationDialog = props => (
  <div>
    <p>Are you sure?</p>
    <button onClick={props.onAction}>{props.label}</button>
    <button onClick={props.cancel}>{'CANCEL'}</button>
  </div>
);

ConfirmationDialog.propTypes = {
  onAction: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

const ProposalInfo = props => (
  <div>
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

  </div>
);

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
    loadProposalsList: PropTypes.func.isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
  };
  constructor(props) {
    super(props);
    this.state = { settings: { pollOption: '2' } };
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
  }
  componentDidMount() {
    this.props.loadProposalsList('active');
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
    const { proposals } = this.props;
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
            />
            <button onClick={this.handleOnSubmit}>START PHASE 2 </button>{' '}
          </div>
        );
        break;
      }

      case 'revoked': {
        content = (
          <ConfirmationDialog
            onAction={this.handleStateChange}
            cancel={() => this.setState({ currentProposal: null })}
            label="Revoke proposal"
          />
        );
        break;
      }

      case 'accepted': {
        content = (
          <ConfirmationDialog
            onAction={this.handleStateChange}
            cancel={() => this.setState({ currentProposal: null })}
            label="Close poll"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ currentProposal: p.id, action: 'revoked' });
                }}
              >
                {'Revoke'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ currentProposal: p.id, action: 'accepted' });
                }}
              >
                {'Close'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({
                    currentProposal: p.id,
                    action: 'voting',
                  });
                }}
              >
                {'Open Voting'}
              </button>
              {p.id === this.state.currentProposal && content}
            </ProposalInfo>,
        )}
      </div>
    );
  }
}

const mapPropsToState = (state) => {
  const proposals = getVisibleProposals(state, 'active');

  return {
    proposals,
  };
};
const mapDispatch = {
  loadProposalsList,
  updateProposal,
};
export default connect(mapPropsToState, mapDispatch)(ProposalsManager);
