import React from 'react';
import CreateProposal from '../CreateProposal';

class ProposalPanel extends React.Component {
  render() {
    return (
      <div>
        <CreateProposal maxTags={8} />
        <h1> ACTIVATE PHASE TWO </h1>
      </div>
    );
  }
}

export default ProposalPanel;
