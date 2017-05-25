import React from 'react';
import ProposalInput from '../ProposalInput';
import ProposalsManager from '../ProposalsManager';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';

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
          <AccordionPanel heading="Post a proposal">
            <ProposalInput maxTags={8} defaultPollValues={defaultPollValues} />
          </AccordionPanel>
          <AccordionPanel heading="Manage open proposals">
            <ProposalsManager defaultPollValues={defaultPollValues} />
          </AccordionPanel>

        </Accordion>

      </div>
    );
  }
}

export default ProposalPanel;
