import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalManager.css';
import {
  // getVisibleProposals,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getProposalsPage,
} from '../../reducers';
import { updateProposal } from '../../actions/proposal';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import PollState from '../PollState';
import Button from '../Button';
import FetchError from '../FetchError';
import Box from '../Box';
import ProposalDetails from '../ProposalDetails';
import Label from '../Label';
import ProposalListEntry from './ProposalListEntry';
import Layer from '../Layer';

const ProposalInfo = props => (
  <Box clickable column onClick={props.onClick}>
    <Label>{props.title}</Label>
    <div style={{ marginTop: '1em' }}>
      <PollState
        compact
        allVoters={props.poll.allVoters}
        upvotes={props.poll.upvotes}
        downvotes={props.poll.downvotes}
        thresholdRef={props.poll.mode.thresholdRef}
        threshold={props.poll.threshold}
        unipolar={props.poll.mode.unipolar}
      />
    </div>

    {props.children}
  </Box>
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
  onClick: PropTypes.func.isRequired,
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
    pageInfo: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    errorMessage: null,
  };
  constructor(props) {
    super(props);
    this.state = { settings: { pollOption: { value: '2' } } };
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.handleProposalClick = this.handleProposalClick.bind(this);
    this.renderProposalList = this.renderProposalList.bind(this);
    this.handleLayerClosing = this.handleLayerClosing.bind(this);
  }
  handleProposalClick({ id }) {
    this.setState({ showDetails: true, activeProposal: id });
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
    this.setState({
      settings: { ...this.state.settings, [e.target.name]: value },
    });
  }

  handleStateChange() {
    const newState = this.state.action;
    this.props.updateProposal({
      id: this.state.currentProposal,
      state: newState,
    });
    this.setState({ currentProposal: null });
  }

  handleLayerClosing() {
    this.setState({ showDetails: false });
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
    const {
      withStatements,
      secret,
      threshold,
      thresholdRef,
      unipolar,
    } = this.state.settings;
    const pollingModeId = this.state.settings.pollOption.value;
    this.props.updateProposal({
      id: this.state.currentProposal,
      poll: {
        startTime,
        endTime,
        secret,
        threshold:
          threshold || this.props.defaultPollValues[pollingModeId].threshold,
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
  renderProposalList(proposals) {
    return (
      <table className={s.proposalList}>
        <thead>
          <tr>
            <th className={s.title}>{'Title'}</th>
            <th>{'Poll'}</th>
            <th className={s.date}>{'Endtime'}</th>
          </tr>
        </thead>
        <tbody>
          {proposals &&
            proposals.map(p => (
              <ProposalListEntry
                key={p.id}
                proposal={p}
                onProposalClick={this.handleProposalClick}
              />
            ))}
        </tbody>
      </table>
    );
  }
  render() {
    const { pageInfo, proposals = [], isFetching, errorMessage } = this.props;
    if (isFetching && !proposals.length) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !proposals.length) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => this.props.loadProposalsList({ state: 'active' })}
        />
      );
    }
    const toRender = proposals.filter(p => p.state === 'proposed');
    toRender.sort(
      (a, b) => new Date(a.pollOne.endTime) - new Date(b.pollOne.endTime),
    );

    return (
      <Box column pad>
        {this.state.showDetails && (
          <Layer onClose={this.handleLayerClosing}>
            <ProposalDetails
              pollOptions={this.props.pollOptions}
              defaultPollValues={this.props.defaultPollValues}
              intl={this.context.intl}
              updateProposal={this.props.updateProposal}
              id={this.state.activeProposal}
              onFinish={this.handleLayerClosing}
            />
          </Layer>
        )}

        {this.renderProposalList(toRender)}
        {/* toRender.map(
          p =>
            p.state === 'proposed' &&
            <ProposalInfo
              title={p.title}
              poll={p.pollOne}
              onClick={() => {
                this.setState({ showDetails: true, activeProposal: p });
              }}
            >
              <span
                style={{
                  height: '1em',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {p.state}
                <span>
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
                      d="M12,18 C15.3137085,18 18,15.3137085 18,12 C18,8.6862915 15.3137085,6 12,6 C8.6862915,6 6,8.6862915 6,12 C6,15.3137085 8.6862915,18 12,18 Z M12,8 L12,12 L15,13"
                    />
                  </svg>
                  <FormattedRelative value={p.pollOne.endTime} />
                </span>
              </span>
            </ProposalInfo>,
        ) */}
        {pageInfo.hasNextPage && (
          <Button
            disabled={this.props.isFetching}
            label="LOAD MORE"
            onClick={() => {
              this.props.loadProposalsList({
                state: 'active',
                after: pageInfo.endCursor,
              });
            }}
          />
        )}
      </Box>
    );
  }
}

const mapPropsToState = state => ({
  // proposals: getVisibleProposals(state, 'active'),
  isFetching: getProposalsIsFetching(state, 'active'),
  errorMessage: getProposalsErrorMessage(state, 'active'),
  pageInfo: getProposalsPage(state, 'active'),
});
const mapDispatch = {
  updateProposal,
  // loadProposalsList,
};
ProposalsManager.contextTypes = {
  intl: PropTypes.object,
};
export default connect(mapPropsToState, mapDispatch)(
  withStyles(s)(ProposalsManager),
);
