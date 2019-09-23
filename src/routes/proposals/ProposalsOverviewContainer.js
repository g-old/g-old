import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProposalsList, loadProposal } from '../../actions/proposal';
import history from '../../history';
import { getVisibleProposals, getResourcePageInfo } from '../../reducers/index';
import { genProposalPageKey } from '../../reducers/pageInfo';
import StateFilter from '../../components/StateFilter';
import ListView from '../../components/ListView';
import ProposalPreview from '../../components/ProposalPreview';
import { sortActiveProposals, sortClosedProposals } from '../utils';
import ProposalInputLayer from '../../components/ProposalInputLayer';
import Box from '../../components/Box';
import Heading from '../../components/Heading';
import Label from '../../components/Label';

const onFilterChange = e => {
  if (e) {
    history.push(`/proposals/${e.option.value}`);
  }
};
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
    const { loadProposalsList: loadProposals, filter } = this.props;
    loadProposals({
      after,
      state: filter,
    });
  }

  handleOnRetry() {
    const { loadProposalsList: loadProposals, filter } = this.props;

    loadProposals({
      state: filter,
    });
  }

  render() {
    const { filter, proposals, pageInfo } = this.props;

    return (
      <Box column>
        <Box pad column>
          <Heading tag="h2"> Vorschläge </Heading>
          <Label>
            {` Citizens' proposals are an opportunity for neighbours and
            collectives to decide directly how they want their city to be, after
            getting sufficient support and submitting to a citizens' vote.`}
          </Label>
        </Box>
        <ProposalInputLayer />
        <StateFilter
          states={['active', 'accepted', 'repelled']}
          filter={filter}
          onChange={onFilterChange}
        />
        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {proposals.map(
            s =>
              s && (
                <ProposalPreview
                  proposal={{ ...s, image: s.image && `/s460/${s.image}` }}
                  onClick={this.onProposalClick}
                />
              ),
          )}
        </ListView>
      </Box>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, { filter = '' }) => ({
  proposals: getVisibleProposals(state, filter)
    .filter(p => !p.workTeamId)
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: filter }),
  ),
});

const mapDispatch = {
  loadProposalsList,
  loadProposal,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(ProposalsOverviewContainer);
