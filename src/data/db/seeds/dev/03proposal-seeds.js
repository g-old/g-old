const Groups = require('../oldseeds/groups');
const VotingProposal = require('../oldseeds/VotingProposal');
const ProposedProposal = require('../oldseeds/ProposedProposals');
const AcceptedFaker = require('../oldseeds/AcceptedFaker');

exports.seed = async function seed(knex, Promise) {
  const [proposed, voting] = await knex('polling_modes')
    .insert([
      {
        name: 'propose',
        unipolar: true,
        with_statements: true,
        threshold_ref: 'all',
      },
      {
        name: 'vote',
        unipolar: false,
        with_statements: true,
        threshold_ref: 'voters',
      },
      {
        name: 'survey',
        unipolar: false,
        with_statements: false,
        threshold_ref: 'voters',
      },
    ])
    .returning('*');
  const [{ count }] = await knex('users')
    .whereRaw('groups & ? > 0', [Groups.VOTER])
    .count('id'); // TODO whitelist

  const authorIds = await knex('users')
    .whereRaw('groups & ? > 0', [Groups.VOTER])
    .pluck('id');

  const proposedFaker = new ProposedProposal(
    { numVoter: count, authorIds },
    knex,
  );

  const proposedProposals = proposedFaker.create(proposed, 20);

  const votingFaker = new VotingProposal({ numVoter: count, authorIds }, knex);
  const votingProposals = votingFaker.create([proposed, voting], 40);

  const acceptedFaker = new AcceptedFaker({ numVoter: count, authorIds }, knex);
  const acceptedProposals = acceptedFaker.create([proposed, voting], 40);
  /*
  const repelledFaker = new RepelledFaker({ numVoter: count, authorIds }, knex);
  const repelledProposals = repelledFaker.create([proposed, voting], 40);

  const revokedFaker = new RevokedFaker({ numVoter: count, authorIds }, knex);
  const revokedProposals = revokedFaker.create([proposed, voting], 40);
  */

  // OWN FILE?
  // const surveyFaker = new SurveyFaker({ numVoter: count, authorIds }, knex);
  // const rsPropossals = surveyFaker.create([proposed, voting], 40);

  return Promise.all([
    ...proposedProposals,
    ...votingProposals,
    ...acceptedProposals,
    // ...repelledProposals,
    // ...revokedProposals,
  ]);
};
