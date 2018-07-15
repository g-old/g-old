import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ListView from '../ListView';
import ProposalPreview from '../ProposalPreview';
import { sortActiveProposals, sortClosedProposals } from '../../routes/utils';
import { getWTProposalsByState, getResourcePageInfo } from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';

export const ListContainerShape = {
  items: PropTypes.arrayOf(PropTypes.shape({})),
  pageInfo: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onRetry: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
};

class ProposalListContainer extends React.Component {
  static propTypes = ListContainerShape;

  static defaultProps = {
    items: null,
  };

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
  items: getWTProposalsByState(state, id, status).sort(
    status === 'active' ? sortActiveProposals : sortClosedProposals,
  ),

  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: status, workteamId: id }),
  ),
  filter: status,
});

export default connect(mapStateToProps)(ProposalListContainer);
