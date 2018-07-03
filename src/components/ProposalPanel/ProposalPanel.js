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
  1: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: 'all',
  },
  2: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: 'voters',
  },
  3: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: 'voters',
  },
};

const pollOptions = [
  {
    value: '1',
    label: <FormattedMessage {...messages.phaseOnePoll} />,
    mId: messages.phaseOnePoll.id,
  },
  {
    value: '2',
    label: <FormattedMessage {...messages.phaseTwoPoll} />,
    mId: messages.phaseTwoPoll.id,
  },
  {
    value: '3',
    label: <FormattedMessage {...messages.survey} />,
    mId: messages.survey.id,
  },
];

class ProposalPanel extends React.Component {
  static propTypes = {
    loadProposalsList: PropTypes.func.isRequired,
    loadTags: PropTypes.func.isRequired,
    updateProposal: PropTypes.func.isRequired,
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    pageInfo: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    proposals: null,
  };

  constructor(props) {
    super(props);
    this.fetchProposals = this.fetchProposals.bind(this);
    this.fetchTags = this.fetchTags.bind(this);
  }

  fetchTags() {
    const { loadTags: fetchTags } = this.props;
    fetchTags();
  }

  fetchProposals({ after } = {}) {
    const { loadProposalsList: loadProposals } = this.props;
    loadProposals({ state: 'active', first: 50, after });
  }

  render() {
    const { proposals, pageInfo, updateProposal: mutateProposal } = this.props;
    return (
      <div>
        <Accordion>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalInput} />}
            onActive={this.fetchTags}
          >
            <ProposalInput
              maxTags={8}
              pollOptions={pollOptions}
              defaultPollValues={defaultPollValues}
            />
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalManager} />}
            onActive={this.fetchProposals}
          >
            <ProposalsManager
              pollOptions={pollOptions}
              defaultPollValues={defaultPollValues}
              proposals={proposals || []}
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
