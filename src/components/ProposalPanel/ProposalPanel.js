import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalInput from '../ProposalInput';
import ProposalsManager from '../ProposalsManager';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import { loadTags, loadProposalsList } from '../../actions/proposal';
import TagManager from '../TagManager';
import { getVisibleProposals } from '../../reducers';

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
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
  };

  static defaultProps = {
    proposals: null,
  };

  render() {
    return (
      <div>
        <Accordion>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalInput} />}
            onActive={() => {
              this.props.loadTags();
            }}
          >
            <ProposalInput
              maxTags={8}
              pollOptions={pollOptions}
              defaultPollValues={defaultPollValues}
            />
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalManager} />}
            onActive={() => {
              this.props.loadProposalsList({ state: 'active', first: 50 });
            }}
          >
            <ProposalsManager
              pollOptions={pollOptions}
              defaultPollValues={defaultPollValues}
              proposals={this.props.proposals || []}
            />
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.tags} />}
            onActive={() => {
              this.props.loadTags();
            }}
          >
            <TagManager />
          </AccordionPanel>
        </Accordion>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  proposals: getVisibleProposals(state, 'active'),
});
const mapDispatch = {
  loadTags,
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(ProposalPanel);
