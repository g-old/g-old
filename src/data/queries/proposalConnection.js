import { GraphQLInt, GraphQLString } from 'graphql';

import PageType from '../types/PageType';
import ProposalType from '../types/ProposalDLType';
// import Proposal from '../models/Proposal';
// import knex from '../knex';
// import Poll from '../models/Poll';

/* const calcEndCursor = async (viewer, proposal, loaders) => {
  const id = proposal.state === 'voting' ? proposal.pollOne_id : proposal.pollOne_id;
  // TODO eager loading of Polls;
  return await Poll.gen(viewer, id, loaders).end_time;
};
*/
const proposal = {
  type: PageType(ProposalType),
  args: {
    first: {
      type: GraphQLInt,
    },
    after: {
      type: GraphQLString,
    },
  },
//  resolve: (parent, { first = 10, after = 0 }, { viewer, loaders }) =>{}
/*
    new Promise((resolve, reject) => {
      const promises2 = knex('polls')
        .where({ closed_at: null })
        .innerJoin('proposals', function () {
          this.on('proposals.poll_one_id', '=', 'polls.id').orOn(
            'proposals.poll_two_id',
            '=',
            'polls.id',
          );
        })
        .orderBy('polls.end_time', 'asc')
        .limit(first)
        .pluck('proposals.id')
        .then(ids => ids.map(id => Proposal.gen(viewer, id, loaders)))
        .then(proms =>
          Promise.all(proms).then((data) => {
            console.log('DATa', data);
            const startCursor = data.length > 0 ? data[0].id : null;
            let endCursor = data.length > 0
              ? calcEndCursor(viewer, data[data.length - 1], loaders).then(
                  endC => (endCursor = endC),
                ) // is async
              : null;
            const hasNextPage = true;
            resolve({
              totalCount: 100,
              edges: data.map(d => ({ node: d })), // [{ node: { id: '1', title: 'TTTT' } },
              { id: '2', title: 'TTcTTT' }],
              pageInfo: {
                startCursor,
                endCursor,
                hasNextPage,
              },
            });
          }),
        );
    }),*/

};

export default proposal;
