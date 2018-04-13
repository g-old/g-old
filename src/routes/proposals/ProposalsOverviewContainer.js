import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProposalsList, loadProposal } from '../../actions/proposal';
import history from '../../history';
import {
  getVisibleProposals,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getProposalsPage,
} from '../../reducers/index';
import FetchError from '../../components/FetchError';
import ProposalsSubHeader from '../../components/ProposalsSubHeader';
import ProposalListView from '../../components/ProposalListView';

const sortActiveProposals = (a, b) => {
  const timeA = new Date(
    a.state === 'proposed' ? a.pollOne.endTime : a.pollTwo.endTime,
  );

  const timeB = new Date(
    b.state === 'proposed' ? b.pollOne.endTime : b.pollTwo.endTime,
  );
  return timeA - timeB;
};
const sortClosedProposals = (a, b) => {
  let timeA;
  let timeB;
  if (a.pollTwo) {
    timeA = new Date(a.pollTwo.closedAt);
  } else {
    timeA = new Date(a.pollOne.closedAt);
  }
  if (b.pollTwo) {
    timeB = new Date(b.pollTwo.closedAt);
  } else {
    timeB = new Date(b.pollOne.closedAt);
  }
  return timeB - timeA;
};

class ProposalsOverviewContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    filter: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    pageInfo: PropTypes.shape({
      endCursor: PropTypes.string,
      hasNextPage: PropTypes.bool,
    }).isRequired,
  };

  static defaultProps = {
    errorMessage: '',
  };

  constructor(props) {
    super(props);
    this.onProposalClick = this.onProposalClick.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.proposals != null;
  }

  render() {
    const { filter, proposals, isFetching, errorMessage } = this.props;
    if (isFetching && !proposals.length) {
      return (
        <div>
          <ProposalsSubHeader filter={filter} />
          <p> Loading ... </p>
        </div>
      );
    }

    if (errorMessage && !proposals.length) {
      return (
        <div>
          <ProposalsSubHeader filter={filter} />

          <FetchError
            isFetching={isFetching}
            message={errorMessage}
            onRetry={() => this.props.loadProposalsList({ state: filter })}
          />
        </div>
      );
    }

    /* const platformProposals = proposals
      .filter(p => !p.workTeamId)
      .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals); */
    return (
      <div>
        {/* <Navigation filter={filter} /> */}
        <ProposalsSubHeader filter={filter} />
        <ProposalListView
          proposals={proposals}
          onProposalClick={this.onProposalClick}
          pageInfo={this.props.pageInfo}
          filter={filter}
          onLoadMore={this.props.loadProposalsList}
          isFetching={isFetching}
        />
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, { filter = '' }) => ({
  proposals: getVisibleProposals(state, filter)
    .filter(p => !p.workTeamId)
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  isFetching: getProposalsIsFetching(state, filter),
  errorMessage: getProposalsErrorMessage(state, filter),
  pageInfo: getProposalsPage(state, filter),
});

const mapDispatch = {
  loadProposalsList,
  loadProposal,
};

export default connect(mapStateToProps, mapDispatch)(
  ProposalsOverviewContainer,
);
