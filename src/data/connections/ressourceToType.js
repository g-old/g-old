import ProposalType from '../types/ProposalType';

function ressurceToType(ressource) {
  let type;
  switch (ressource) {
    case 'proposal':
      type = ProposalType;
      break;
    default:
      throw new Error(`Ressource not recognized: ${ressource}`);
  }
  return type;
}

export default ressurceToType;
