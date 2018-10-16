import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
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
  phaseOnePoll: {
    id: 'proposalManager.phaseOnePoll',
    defaultMessage: 'TR: 25 - PHASE ONE - NO STATEMENTS',
    description: 'PhaseOnePoll presets',
  },
  phaseTwoPoll: {
    id: 'proposalManager.phaseTwoPoll',
    defaultMessage: 'TR: 50 - PHASE TWO - WITH STATEMENTS',
    description: 'PhaseTwoPoll presets',
  },
  survey: {
    id: 'proposalManager.survey',
    defaultMessage: 'Survey',
    description: 'Survey presets',
  },
  tags: {
    id: 'tags',
    defaultMessage: 'Tags',
    description: 'Tags',
  },
});
const defaultPollValues = {
  proposed: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: 'all',
  },
  voting: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: 'voters',
  },
  survey: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: 'voters',
  },
};

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

  getPollOptions() {
    const { intl } = this.props;
    return [
      {
        value: 'proposed',
        label: intl.formatMessage(messages.phaseOnePoll),
      },
      {
        value: 'voting',
        label: intl.formatMessage(messages.phaseTwoPoll),
      },
      {
        value: 'survey',
        label: intl.formatMessage(messages.survey),
      },
    ];
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
    const {
      proposals,
      pageInfo,
      updateProposal: mutateProposal,
      surveys,
    } = this.props;
    return (
      <div>
        <Accordion>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalInput} />}
            onActive={this.fetchTags}
          >
            <ProposalInput
              maxTags={8}
              availablePolls={this.getPollOptions()}
              defaultPollSettings={defaultPollValues}
            />
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalManager} />}
            onActive={this.fetchProposals}
          >
            <ProposalsManager
              availablePolls={this.getPollOptions()}
              defaultPollValues={defaultPollValues}
              proposals={(proposals || [])
                .filter(p => p.state === 'proposed')
                .sort(
                  (a, b) =>
                    new Date(a.pollOne.endTime) - new Date(b.pollOne.endTime),
                )}
              pageInfo={pageInfo}
              updateProposal={mutateProposal}
              loadProposals={this.fetchProposals}
            />
          </AccordionPanel>
          <AccordionPanel heading="Manage surveys" onActive={this.fetchSurveys}>
            <ProposalsManager
              availablePolls={this.getPollOptions()}
              defaultPollValues={defaultPollValues}
              proposals={(surveys || []).filter(
                s => (s.pollOne ? !s.pollOne.closedAt : false),
              )}
              pageInfo={pageInfo}
              updateProposal={mutateProposal}
              loadProposals={this.fetchSurveys}
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
)(injectIntl(ProposalPanel));
