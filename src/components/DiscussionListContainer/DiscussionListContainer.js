import React from 'react';
import { connect } from 'react-redux';
import { getWTDiscussionsByState, getDiscussionPageInfo } from '../../reducers';
import DiscussionPreview from '../DiscussionPreview';
import ListView from '../ListView';
import { ListContainerShape } from '../ProposalListContainer';

class DiscussionListContainer extends React.Component {
  static propTypes = ListContainerShape;
  render() {
    const {
      discussions,
      pageInfo,
      onRetry,
      onLoadMore,
      onItemClick,
    } = this.props;
    return (
      <ListView onRetry={onRetry} onLoadMore={onLoadMore} pageInfo={pageInfo}>
        {discussions.map(
          d => d && <DiscussionPreview discussion={d} onClick={onItemClick} />,
        )}
      </ListView>
    );
  }
}

const mapStateToProps = (state, { status, id }) => ({
  discussions: getWTDiscussionsByState(state, id, status),
  pageInfo: getDiscussionPageInfo(state, status),
});

export default connect(mapStateToProps)(DiscussionListContainer);
