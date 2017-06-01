import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalInput from '../ProposalInput';
import ProposalsManager from '../ProposalsManager';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';

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
  render() {
    return (
      <div>
        <Accordion>
          <AccordionPanel heading={<FormattedMessage {...messages.proposalInput} />}>
            <ProposalInput maxTags={8} defaultPollValues={defaultPollValues} />
          </AccordionPanel>
          <AccordionPanel heading={<FormattedMessage {...messages.proposalManager} />}>
            <ProposalsManager defaultPollValues={defaultPollValues} />
          </AccordionPanel>

        </Accordion>

      </div>
    );
  }
}

export default ProposalPanel;
