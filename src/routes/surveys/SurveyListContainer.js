import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProposalListView from '../../components/ProposalListView';

import { loadProposalsList } from '../../actions/proposal';
import {
  getVisibleProposals,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getProposalsPage,
} from '../../reducers/index';
import FetchError from '../../components/FetchError';
import history from '../../history';

class SurveyListContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
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
    this.handleSurveyClick = this.handleSurveyClick.bind(this);
  }
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.proposals != null;
  }

  // eslint-disable-next-line class-methods-use-this
  handleSurveyClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }
  render() {
    const { proposals, isFetching, errorMessage } = this.props;
    if (isFetching && !proposals.length) {
      return <p> Loading ... </p>;
    }

    if (errorMessage && !proposals.length) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => this.props.loadProposalsList({ state: 'survey' })}
        />
      );
    }

    return (
      <div>
        <ProposalListView
          proposals={proposals}
          onProposalClick={this.handleSurveyClick}
          pageInfo={this.props.pageInfo}
          filter="survey"
          onLoadMore={this.props.loadProposalsList}
          isFetching={isFetching}
        />
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = state => ({
  proposals: getVisibleProposals(state, 'survey').sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
  ),
  isFetching: getProposalsIsFetching(state, 'survey'),
  errorMessage: getProposalsErrorMessage(state, 'survey'),
  pageInfo: getProposalsPage(state, 'survey'),
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(SurveyListContainer);
