import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProposalPreview from '../../components/ProposalPreview';
import Select from '../../components/Select';
import { loadProposalsList } from '../../actions/proposal';
import { getVisibleProposals, getProposalsPage } from '../../reducers/index';
import history from '../../history';
import ListView from '../../components/ListView';
import {
  surveyStateFilter,
  sortActiveProposals,
  sortClosedProposals,
} from '../utils';

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
    this.props.loadProposalsList({
      after,
      state: 'survey',
      closed: this.props.filter === 'closed',
    });
  }

  handleOnRetry() {
    this.props.loadProposalsList({
      state: 'survey',
      closed: this.props.filter === 'closed',
    });
  }
  render() {
    const { surveys, pageInfo } = this.props;
    return (
      <div>
        <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
          <span style={{ maxWidth: '10em' }}>
            <Select
              value={this.props.filter}
              onChange={e => {
                history.push(`/surveys/${e.option}`);
              }}
              options={['active', 'closed']}
            />
          </span>
        </div>
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
  pageInfo: getProposalsPage(state, 'survey'),
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(SurveysOverviewContainer);
