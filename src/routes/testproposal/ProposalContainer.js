/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TestProposal from '../../components/TestProposal2';
import { getProposal, getIsProposalFetching, getProposalErrorMessage } from '../../reducers';
import FetchError from '../../components/FetchError';

class ProposalContainer extends React.Component {
  static propTypes = {
    proposal: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    proposalId: PropTypes.number.isRequired,
    createLike: PropTypes.func,
    isFetching: PropTypes.bool,
    fetchData: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
  };
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.proposal != null;
  }
  render() {
    const { proposal, isFetching, errorMessage } = this.props;

    if (isFetching && !proposal) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !proposal) {
      return <FetchError message={errorMessage} onRetry={this.props.fetchData} />;
    }
    if (this.isReady()) {
      return <TestProposal user={this.props.user} proposal={this.props.proposal} />;
    }
    return <div>STILL LOADING ...</div>;
  }
}
ProposalContainer.propTypes = {};
// TODO implement memoiziation with reselect
const mapStateToProps = (state, ownProps) => ({
  proposal: getProposal(state, ownProps.proposalId),
  isFetching: getIsProposalFetching(state, ownProps.proposalId),
  errorMessage: getProposalErrorMessage(state, ownProps.proposalId),
});

export default connect(mapStateToProps)(ProposalContainer);
