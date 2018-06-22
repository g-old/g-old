import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ListView from '../ListView';
import ProposalPreview from '../ProposalPreview';

import {
  getWTProposalsByState,
  getProposalsPage,
  getProposalsIsFetching,
  getProposalsErrorMessage,
} from '../../reducers';

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
    const { items, pageInfo, onRetry, onLoadMore, onItemClick } = this.props;
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
  items: getWTProposalsByState(state, id, status),
  pageInfo: getProposalsPage(state, status),
  filter: status,
  isFetching: getProposalsIsFetching(state, status),
  errorMessage: getProposalsErrorMessage(state, status),
});

export default connect(mapStateToProps)(ProposalListContainer);
