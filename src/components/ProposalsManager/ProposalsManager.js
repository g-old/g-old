import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getVisibleProposals } from '../../reducers';
import { loadProposalsList, updateProposal } from '../../actions/proposal';
import PollInput from '../PollInput';
import { concatDateAndTime } from '../../core/helpers';
import PollState from '../PollState';

const ConfirmationDialog = props => (
  <div>
    <p>Are you sure?</p>
    <button onClick={props.revoke}>{'REVOKE POPOSAL'}</button>
    <button onClick={props.cancel}>{'CANCEL'}</button>
  </div>
);

ConfirmationDialog.propTypes = {
  revoke: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
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
    this.state = { pollOption: '2', settings: {} };
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleRevoke = this.handleRevoke.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
  }
  componentDidMount() {
    this.props.loadProposalsList('active');
  }
  handleValueChanges(e) {
    if (e.target.name === 'threshold' || e.target.checked == null) {
      const value = e.target.value;
      if (e.target.name === 'pollOption') {
        this.setState({
          [e.target.name]: value,
          settings: { threshold: this.props.defaultPollValues[value].threshold },
        });
      } else {
        this.setState({ settings: { ...this.state.settings, [e.target.name]: value } });
      }
    } else {
      this.setState({ settings: { ...this.state.settings, [e.target.name]: e.target.checked } });
    }
  }

  handleRevoke() {
    this.props.updateProposal({ id: this.state.currentProposal, state: 'revoked' });
    this.setState({ currentProposal: null });
  }

  handleOnSubmit() {
    // TODO sanitize input

    let startTime = null;
    let endTime = null;
    const { dateFrom, timeFrom, dateTo, timeTo } = this.state.settings;
    if (dateFrom || timeFrom) {
      startTime = concatDateAndTime(dateFrom, timeFrom);
    }

    if (dateTo || timeTo) {
      endTime = concatDateAndTime(dateTo, timeTo);
    }
    const { withStatements, secret, threshold, thresholdRef, unipolar } = this.state.settings;

    const pollingModeId = this.state.pollOption;
    this.props.updateProposal({
      id: this.state.currentProposal,
      poll: {
        startTime,
        endTime,
        secret,
        threshold: threshold || 50,
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
    const content = this.state.voting
      ? (<div>
        <PollInput
          onValueChange={this.handleValueChanges}
          handleDateChange={this.handleValueChanges}
          selectedPMode={this.state.pollOption}
          displaySettings={this.state.displaySettings}
          defaultPollValues={this.props.defaultPollValues}
          pollValues={settings}
          toggleSettings={this.toggleSettings}
        />
        <button onClick={this.handleOnSubmit}>START PHASE 2 </button>{' '}
      </div>)
      : (<ConfirmationDialog
        revoke={this.handleRevoke}
        cancel={() => this.setState({ currentProposal: null })}
      />);
    return (
      <div>
        <h1> ACTIVATE PHASE TWO </h1>
        PROPOSALS
        {toRender.map(
          p =>
            p.state === 'proposed' &&
            <ProposalInfo title={p.title} poll={p.pollOne}>
              STATE {p.state} <br />
              ENDTIME {p.pollOne.end_time} <br />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ currentProposal: p.id, voting: false });
                }}
              >
                {'Revoke'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({
                    currentProposal: p.id,
                    pollOption: '2',
                    voting: true,
                    settings: {},
                  });
                }}
              >
                {'Open Voting'}
              </button>
              {p.id === this.state.currentProposal && content}
            </ProposalInfo>,
          /*<ProposalPreview proposal={p}>
              STATE {p.state} <br />
              ENDTIME {p.pollOne.end_time} <br />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ currentProposal: p.id, voting: false });
                }}
              >
                {'Revoke'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ currentProposal: p.id, pollOption: '2', voting: true });
                }}
              >
                {'Open Voting'}
              </button>
              {p.id === this.state.currentProposal && content}

            </ProposalPreview>*/
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
