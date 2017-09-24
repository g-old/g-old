import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalPreview from '../../components/ProposalPreview';
import { loadProposalsList } from '../../actions/proposal';
import {
  getVisibleProposals,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getProposalsPage,
} from '../../reducers/index';
import Button from '../../components/Button';
import FetchError from '../../components/FetchError';
import ProposalsSubHeader from '../../components/ProposalsSubHeader';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});
class ProposalContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    filter: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    errorMessage: PropTypes.string.isRequired,
    pageInfo: PropTypes.shape({
      endCursor: PropTypes.string,
      hasNextPage: PropTypes.bool,
    }).isRequired,
    state: PropTypes.string.isRequired,
  };
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

    return (
      <div>
        {/* <Navigation filter={filter} /> */}
        <ProposalsSubHeader filter={filter} />
        {proposals.map(proposal => (
          <ProposalPreview key={proposal.id} proposal={proposal} />
        ))}
        {this.props.pageInfo.hasNextPage && (
          <Button
            primary
            disabled={isFetching}
            onClick={() => {
              this.props.loadProposalsList({
                state: this.props.state,
                after: this.props.pageInfo.endCursor,
              });
            }}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, ownProps) => ({
  proposals: getVisibleProposals(state, ownProps.state),
  filter: ownProps.state,
  isFetching: getProposalsIsFetching(state, ownProps.state),
  errorMessage: getProposalsErrorMessage(state, ownProps.state),
  pageInfo: getProposalsPage(state, ownProps.state),
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(ProposalContainer);
