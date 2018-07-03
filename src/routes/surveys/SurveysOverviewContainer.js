import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProposalPreview from '../../components/ProposalPreview';
import StateFilter from '../../components/StateFilter';
import { loadProposalsList } from '../../actions/proposal';
import { getVisibleProposals, getResourcePageInfo } from '../../reducers/index';
import { genProposalPageKey } from '../../reducers/pageInfo';
import history from '../../history';
import ListView from '../../components/ListView';
import {
  surveyStateFilter,
  sortActiveProposals,
  sortClosedProposals,
} from '../utils';

const onFilterChange = e => {
  if (e) {
    history.push(`/surveys/${e.option.value}`);
  }
};
class SurveysOverviewContainer extends React.Component {
  static propTypes = {
    surveys: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({
      endCursor: PropTypes.string,
      hasNextPage: PropTypes.bool,
    }).isRequired,
    filter: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleSurveyClick = this.handleSurveyClick.bind(this);
    this.handleOnRetry = this.handleOnRetry.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  handleSurveyClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  handleLoadMore({ after }) {
    const { loadProposalsList: loadProposals, filter } = this.props;

    loadProposals({ after, state: 'survey', closed: filter === 'closed' });
  }

  handleOnRetry() {
    const { loadProposalsList: loadProposals, filter } = this.props;
    loadProposals({ state: 'survey', closed: filter === 'closed' });
  }

  render() {
    const { surveys, pageInfo, filter } = this.props;
    return (
      <div>
        <StateFilter
          states={['active', 'closed']}
          filter={filter}
          onChange={onFilterChange}
        />

        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {surveys.map(
            s =>
              s && (
                <ProposalPreview
                  proposal={s}
                  onClick={this.handleSurveyClick}
                />
              ),
          )}
        </ListView>
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, { filter }) => ({
  surveys: getVisibleProposals(state, 'survey')
    .filter(s => surveyStateFilter(s, filter))
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'survey', closed: filter }),
  ),
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(SurveysOverviewContainer);
