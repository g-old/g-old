import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalInput from '../ProposalInput';
import ProposalsManager from '../ProposalsManager';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import {
  loadTags,
  loadProposalsList,
  updateProposal,
} from '../../actions/proposal';
import TagManager from '../TagManager';
import { getVisibleProposals, getResourcePageInfo } from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';

import withPollSettings from '../ProposalInput/withPollSettings';

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
});

const ProposalInputAllSettings = withPollSettings(ProposalInput);

class ProposalPanel extends React.Component {
  static propTypes = {
    loadProposalsList: PropTypes.func.isRequired,
    loadTags: PropTypes.func.isRequired,
    updateProposal: PropTypes.func.isRequired,
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    pageInfo: PropTypes.shape({}).isRequired,
    surveys: PropTypes.arrayOf(PropTypes.shape({})),
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
  }

  getModifyableProposals() {
    const { proposals } = this.props;
    return (proposals || []).filter(p =>
      ['voting', 'proposed'].includes(p.state),
    );
  }

  fetchTags() {
    const { loadTags: fetchTags } = this.props;
    fetchTags();
  }

  fetchProposals({ after } = {}) {
    const { loadProposalsList: loadProposals } = this.props;
    loadProposals({ state: 'active', first: 50, after });
  }

  fetchSurveys({ after } = {}) {
    const { loadProposalsList: loadProposals } = this.props;
    loadProposals({ state: 'survey', first: 50, after });
  }

  render() {
    const { pageInfo, updateProposal: mutateProposal, surveys } = this.props;
    const changeableProposals = this.getModifyableProposals();
    return (
      <div>
        <Accordion>
          <AccordionPanel
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
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.tags} />}
            onActive={this.fetchTags}
          >
            <TagManager />
          </AccordionPanel>
        </Accordion>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  proposals: getVisibleProposals(state, 'active').filter(p => !p.workTeamId),
  surveys: getVisibleProposals(state, 'survey').filter(p => !p.workTeamId),
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
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(ProposalPanel);
