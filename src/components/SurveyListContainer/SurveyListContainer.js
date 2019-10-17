import React from 'react';
import { connect } from 'react-redux';
import { ListContainerShape } from '../ProposalListContainer';
import ListView from '../ListView';
import ProposalPreview from '../ProposalPreview';
import { getWTProposalsByState, getResourcePageInfo } from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';
import {
  surveyStateFilter,
  sortActiveProposals,
  sortClosedProposals,
} from '../../routes/utils';

class SurveyListContainer extends React.Component {
  static propTypes = ListContainerShape;

  static defaultProps = { items: null };

  render() {
    const { items, onRetry, onLoadMore, onItemClick, pageInfo } = this.props;
    return (
      <ListView
        boxed
        onRetry={onRetry}
        onLoadMore={onLoadMore}
        pageInfo={pageInfo}
      >
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
    .sort(status === 'active' ? sortActiveProposals : sortClosedProposals),

  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'survey', closed: status, workteamId: id }),
  ),
});

export default connect(mapStateToProps)(SurveyListContainer);
