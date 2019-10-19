import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
// import ProposalInput from '../ProposalInput';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import {
  loadTags,
  loadProposalsList,
  updateProposal,
} from '../../actions/proposal';
import TagManager from '../TagManager';
import {
  getVisibleProposals,
  getResourcePageInfo,
  getWorkTeams,
  getAllProposals,
} from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';
import { loadWorkTeams } from '../../actions/workTeam';
// import withPollSettings from '../ProposalInput/withPollSettings';
import ProposalFilter from './ProposalFilter';
import ProposalTable, { correctFilter } from './ProposalTable';
import Box from '../Box';
import Layer from '../Layer';
import ProposalActions from '../ProposalActions';

const messages = defineMessages({
  proposalInput: {
    id: 'proposalInput',
    defaultMessage: 'Create a new proposal',
    description: 'Creating new proposal',
  },
  proposalManager: {
    id: 'proposalManager',
    defaultMessage: 'Manage proposals',
    description: 'Manage proposals',
  },

  tags: {
    id: 'tags',
    defaultMessage: 'Tags',
    description: 'Tags',
  },
  active: {
    id: 'resource.active',
    defaultMessage: 'active',
    description: 'Filter for active proposals/surveys/discussions',
  },
});

// const ProposalInputAllSettings = withPollSettings(ProposalInput);

class ProposalPanel extends React.Component {
  static propTypes = {
    loadProposalsList: PropTypes.func.isRequired,
    loadTags: PropTypes.func.isRequired,
    updateProposal: PropTypes.func.isRequired,
    loadWorkTeams: PropTypes.func.isRequired,
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    pageInfo: PropTypes.shape({}).isRequired,
    surveys: PropTypes.arrayOf(PropTypes.shape({})),
    intl: intlShape.isRequired,
    workteams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {
    proposals: null,
    surveys: null,
  };

  constructor(props) {
    super(props);
    this.fetchProposals = this.fetchProposals.bind(this);
    this.fetchSurveys = this.fetchSurveys.bind(this);
    this.fetchTags = this.fetchTags.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
    this.state = {
      filter: {
        state: {
          value: 'active',
          label: props.intl.formatMessage(messages.active),
        },
      },
    };
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
  }

  componentDidMount() {
    this.fetchProposals();
    // eslint-disable-next-line react/destructuring-assignment
    this.props.loadWorkTeams(false, true);
  }

  getModifyableProposals() {
    const { proposals } = this.props;
    return (proposals || []).filter(p =>
      ['voting', 'proposed'].includes(p.state),
    );
  }

  toggleLayer() {
    this.setState(prevState => ({ showLayer: !prevState.showLayer }));
  }

  // TODO refactor - same in every filter component
  handleFilterChange(data) {
    this.setState(prevState => {
      if (prevState.filter[data.type]) {
        let toDelete;
        if (prevState.filter.objectId && data.type === 'type') {
          toDelete = true;
        }

        const { [data.type]: omit, ...filter } = prevState.filter;
        return {
          filter: {
            ...filter,
            ...(omit === data.value ? [] : { [data.type]: data.value }),
            ...(toDelete ? { objectId: undefined } : []),
          },
        };
      }
      return { filter: { ...prevState.filter, [data.type]: data.value } };
    }, this.fetchProposals);
  }

  fetchTags() {
    const { loadTags: fetchTags } = this.props;
    fetchTags();
  }

  onMenuClick(action, data) {
    this.setState({ currentProposal: data, showLayer: true });
  }

  fetchProposals(after) {
    const { loadProposalsList: loadProposals } = this.props;
    const { filter } = this.state;
    loadProposals({
      ...correctFilter(filter),
      first: 10,
      after,
    });
  }

  fetchSurveys({ after } = {}) {
    const { loadProposalsList: loadProposals } = this.props;
    loadProposals({ state: 'survey', first: 50, after });
  }

  render() {
    const {
      updateProposal: mutateProposal,
      // surveys,
      workteams,
      intl,
    } = this.props;
    const { filter, showLayer, currentProposal } = this.state;
    // const changeableProposals = this.getModifyableProposals();
    return (
      <Box column>
        <ProposalFilter
          workteams={workteams || []}
          values={filter}
          onSelect={this.handleFilterChange}
        />
        <ProposalTable
          filter={filter}
          onLoadMore={this.fetchProposals}
          onClick={this.onMenuClick}
        />
        {showLayer && (
          <Layer onClose={this.toggleLayer}>
            <ProposalActions
              intl={intl}
              updateProposal={mutateProposal}
              id={currentProposal.id}
              onFinish={this.toggleLayer}
            />
          </Layer>
        )}
        {/* <AssetsTable
          onClickMenu={this.onMenuClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={allProposals || []}
          row={ProposalRow}
          tableHeaders={[
            'title',
            'approvalState',
            'state',
            'poll',
            'has team',
            'Created at',
            '',
          ]}
        />
        {pageInfo.pagination.hasNextPage && (
          <Button
            primary
            disabled={pageInfo.pending}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )} */}
        <Accordion>
          {/* <AccordionPanel
            heading={<FormattedMessage {...messages.proposalManager} />}
            onActive={this.fetchProposals}
          >
            <ProposalsManager
              proposals={changeableProposals.sort(
                (a, b) =>
                  new Date(a.pollTwo ? a.pollTwo.endTime : a.pollOne.endTime) -
                  new Date(b.pollTwo ? b.pollTwo.endTime : b.pollOne.endTime),
              )}
              pageInfo={pageInfo}
              updateProposal={mutateProposal}
              loadProposals={this.fetchProposals}
            />
          </AccordionPanel> */}
          <AccordionPanel
            heading={<FormattedMessage {...messages.tags} />}
            onActive={this.fetchTags}
          >
            <TagManager />
          </AccordionPanel>
        </Accordion>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  proposals: getVisibleProposals(state, 'active').filter(p => !p.workTeamId),
  surveys: getVisibleProposals(state, 'survey').filter(p => !p.workTeamId),
  allProposals: getAllProposals(state), // TODO CHANGE
  workteams: getWorkTeams(state),

  surveyPageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'survey' }),
  ),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'active' }),
  ), // getProposalsPage(state, 'active'),
});
const mapDispatch = {
  loadTags,
  loadProposalsList,
  updateProposal,
  loadWorkTeams,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(injectIntl(ProposalPanel));
