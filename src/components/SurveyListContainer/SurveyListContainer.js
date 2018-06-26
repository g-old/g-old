import React from 'react';
import { connect } from 'react-redux';
import { ListContainerShape } from '../ProposalListContainer';
import ListView from '../ListView';
import ProposalPreview from '../ProposalPreview';
import { getWTProposalsByState, getProposalsPage } from '../../reducers';
import { surveyStateFilter } from '../../routes/surveys/SurveysOverviewContainer';

class SurveyListContainer extends React.Component {
  static propTypes = ListContainerShape;
  static defaultProps = { items: null };
  render() {
    const { items, onRetry, onLoadMore, onItemClick, pageInfo } = this.props;
    return (
      <ListView onRetry={onRetry} onLoadMore={onLoadMore} pageInfo={pageInfo}>
        {items.map(
          d => d && <ProposalPreview proposal={d} onClick={onItemClick} />,
        )}
      </ListView>
    );
  }
}

const mapStateToProps = (state, { status, id }) => ({
  items: getWTProposalsByState(state, id, 'survey')
    .filter(s => surveyStateFilter(s, status))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),

  pageInfo: getProposalsPage(state, 'survey'),
});

export default connect(mapStateToProps)(SurveyListContainer);
