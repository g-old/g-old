import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProposalsList, loadProposal } from '../../actions/proposal';
import history from '../../history';
import { getVisibleProposals, getProposalsPage } from '../../reducers/index';
import ProposalsSubHeader from '../../components/ProposalsSubHeader';
import ListView from '../../components/ListView';
import ProposalPreview from '../../components/ProposalPreview';
import { sortActiveProposals, sortClosedProposals } from '../utils';

class ProposalsOverviewContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    filter: PropTypes.string.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
  };

  constructor(props) {
    super(props);
    this.onProposalClick = this.onProposalClick.bind(this);
    this.handleOnRetry = this.handleOnRetry.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  handleLoadMore({ after }) {
    this.props.loadProposalsList({
      after,
      state: this.props.filter,
    });
  }

  handleOnRetry() {
    this.props.loadProposalsList({
      state: this.props.filter,
    });
  }

  render() {
    const { filter, proposals, pageInfo } = this.props;

    return (
      <div>
        {/* <Navigation filter={filter} /> */}
        <ProposalsSubHeader filter={filter} />
        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {proposals.map(
            s =>
              s && (
                <ProposalPreview proposal={s} onClick={this.onProposalClick} />
              ),
          )}
        </ListView>
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, { filter = '' }) => ({
  proposals: getVisibleProposals(state, filter)
    .filter(p => !p.workTeamId)
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  pageInfo: getProposalsPage(state, filter),
});

const mapDispatch = {
  loadProposalsList,
  loadProposal,
};

export default connect(mapStateToProps, mapDispatch)(
  ProposalsOverviewContainer,
);
