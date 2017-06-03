import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalInput from '../ProposalInput';
import ProposalsManager from '../ProposalsManager';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import { loadTags, loadProposalsList } from '../../actions/proposal';

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
});
const defaultPollValues = {
  1: {
    withStatements: false,
    unipolar: true,
    threshold: 20,
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
};

class ProposalPanel extends React.Component {
  static propTypes = {
    loadProposalsList: PropTypes.func.isRequired,
    loadTags: PropTypes.func.isRequired,
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
            <ProposalInput maxTags={8} defaultPollValues={defaultPollValues} />
          </AccordionPanel>
          <AccordionPanel
            heading={<FormattedMessage {...messages.proposalManager} />}
            onActive={() => {
              this.props.loadProposalsList('active');
            }}
          >
            <ProposalsManager defaultPollValues={defaultPollValues} />
          </AccordionPanel>

        </Accordion>

      </div>
    );
  }
}

const mapDispatch = {
  loadTags,
  loadProposalsList,
};

export default connect(null, mapDispatch)(ProposalPanel);
