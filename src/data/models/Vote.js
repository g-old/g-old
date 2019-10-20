import knex from '../knex';
import Poll from './Poll';
import Proposal from './Proposal';
import Statement from './Statement';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';

class Vote {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.positions = data.positions;
    this.pollId = data.poll_id;
  }

  static async gen(viewer, id, loaders) {
    if (!id) return null;
    const data = await loaders.votes.load(id);
    if (data === null) return null;
    const proposal = await Proposal.genByPoll(viewer, data.poll_id, loaders);
    data.proposal = proposal;
    if (!canSee(viewer, data, Models.VOTE)) return null;
    return new Vote(data);
  }

  static async validate(viewer, data, loaders, poll, trx, mutation = false) {
    if (!poll || !poll.isVotable()) return null;

    const proposal = await Proposal.genByPoll(viewer, poll.id, loaders);
    if (!proposal || !(await proposal.isVotable(viewer))) return null;

    const voteInDB = await knex('votes')
      .transacting(trx)
      .forUpdate()
      .where({ poll_id: data.pollId, user_id: viewer.id })
      .select();

    if (mutation && voteInDB.length === 0) return null;
    if (voteInDB.length !== 0) return mutation ? { ...voteInDB[0] } : null;
    return true;
  }

  static async delete(viewer, data, loaders) {
    if (!data.id) return null;
    if (!data.pollId) return null;
    const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);
    if (!canMutate(viewer, { ...data, proposal }, Models.VOTE)) return null;
    let deletedStatement;
    let deletedVote;
    try {
      deletedVote = await knex.transaction(async trx => {
        const [pollData] = await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          .select('*');
        const poll = new Poll(pollData);
        const oldVote = await Vote.validate(
          viewer,
          data,
          loaders,
          poll,
          trx,
          true,
        );
        if (!oldVote || !oldVote.positions) throw Error('Request invalid!');
        // eslint-disable-next-line eqeqeq
        if (data.id != oldVote.id) throw Error('Request invalid!');
        if (data.positions[0].pos !== oldVote.positions[0].pos) {
          // ???
          throw Error('Request invalid!');
        }
        // eslint-disable-next-line newline-per-chained-call
        // check if statements exists, check if it can be deleted (cascading)
        const [statementInDB = null] = await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ vote_id: data.id })
          .select();
        if (statementInDB) {
          if (statementInDB.deleted_at) {
            throw Error('Cannot be modified!');
          }
          deletedStatement = new Statement(statementInDB);
          // statement gets deleted by cascading on delete
        }
        // eslint-disable-next-line newline-per-chained-call

        await knex('votes')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.id })
          .del();
        // update votecount

        const updatedOptions = [];
        // better allow only one position?
        for (let i = 0; i < poll.options.length; i += 1) {
          const option = poll.options[i];
          if (option.pos === data.positions[0].pos) {
            option.numVotes -= 1;
          }
          updatedOptions.push(option);
        }

        await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          .update({
            num_votes: poll.numVotes - 1,
            options: JSON.stringify(updatedOptions),
          });
        return oldVote;
      });
    } catch (e) {
      return { deletedVote: null, deletedStatement: null };
    }
    const delVote = new Vote(deletedVote);
    if (deletedVote) {
      EventManager.publish('onVoteDeleted', {
        viewer,
        vote: delVote,
        ...(proposal.workteamId && {
          groupId: proposal.workteamId,
          info: { workteamId: proposal.workteamId },
        }),
      });
    }
    if (deletedStatement) {
      EventManager.publish('onStatementDeleted', {
        viewer,
        statement: deletedStatement,
        ...(proposal.workteamId && {
          groupId: proposal.workteamId,
          info: { workteamId: proposal.workteamId },
        }),
      });
    }
    return { deletedVote: delVote || null, deletedStatement };
  }

  static async update(viewer, data, loaders) {
    // throw Error('TESTERROR');

    if (!data.id) return null;
    if (!data.pollId) return null;
    const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);
    if (!canMutate(viewer, { ...data, proposal }, Models.VOTE)) return null;

    let deletedStatement;
    let poll;
    let oldVote;
    try {
      await knex.transaction(async trx => {
        const [pollData = null] = await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          .select();
        poll = new Poll(pollData);
        if (await poll.isUnipolar(viewer, loaders)) {
          throw new Error('Poll is unipolar'); // delete is the right method
        }
        oldVote = await Vote.validate(viewer, data, loaders, poll, trx, true);
        if (!oldVote || !oldVote.positions) {
          /* if (oldVote.positions[0].pos === data.positions[0].pos)
            throw Error('Position mismatch');
            */
        }
        // eslint-disable-next-line eqeqeq
        if (data.id != oldVote.id) throw Error('Id mismatch');

        const [statementInDB = null] = await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ vote_id: data.id })
          .select();
        if (statementInDB) {
          if (statementInDB.deleted_at) {
            throw Error('Cannot be modified!');
          }
          deletedStatement = new Statement(statementInDB);

          // eslint-disable-next-line newline-per-chained-call
          await knex('statements')
            .transacting(trx)
            .forUpdate()
            .where({ vote_id: data.id })
            .del();
        }

        const updatedData = { updated_at: new Date() };
        if (data.positions) {
          const oldPositions = oldVote.positions.reduce((obj, position) => {
            // eslint-disable-next-line
            obj[position.pos] = position;
            return obj;
          }, {});

          const dataPositions = data.positions.reduce((obj, position) => {
            // eslint-disable-next-line
            obj[position.pos] = position;
            return obj;
          }, {});

          // if not extended or not multiple choice
          let newPositions;
          if (!poll.extended || !poll.multipleChoice) {
            // check which option was already voted, clear it and mark new option
            const votePosition = data.positions.find(
              position => position.value,
            );
            newPositions = poll.options.reduce((obj, option) => {
              if (votePosition.pos === option.pos) {
                obj.push(votePosition);
              }
              return obj;
            }, []);
          } else {
            newPositions = poll.options.reduce((obj, option) => {
              if (oldPositions[option.pos]) {
                // position exists
                if (dataPositions[option.pos]) {
                  // take new
                  if (dataPositions[option.pos].value) {
                    obj.push(dataPositions[option.pos]);
                  }
                } else {
                  obj.push(oldPositions[option.pos]);
                }
              } else if (dataPositions[option.pos]) {
                if (dataPositions[option.pos].value) {
                  obj.push(dataPositions[option.pos]);
                }
              }
              return obj;
            }, []);
          }

          if (!newPositions.length) {
            throw new Error('Position missing');
          }
          updatedData.positions = JSON.stringify(newPositions);
        }

        // eslint-disable-next-line newline-per-chained-call
        await knex('votes')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.id })
          .update(updatedData);
        // update votecount
        const updatedOptions = [];
        // better allow only one position?
        for (let i = 0; i < poll.options.length; i += 1) {
          const option = poll.options[i];
          if (poll.extended) {
            if (poll.multipleChoice) {
              if (option.pos === data.positions[0].pos) {
                option.numVotes = data.positions[0].value
                  ? option.numVotes + 1
                  : option.numVotes - 1;
              }
            } else {
              // get new vote position, count up, get old position, count down
              if (option.pos === data.positions[0].pos) {
                option.numVotes += 1;
              }
              if (option.pos === oldVote.positions[0].pos) {
                // only one bc not multiplechoice
                option.numVotes -= 1;
              }
            }
          } else if (
            option.pos === data.positions[0].pos &&
            data.positions[0].value
          ) {
            option.numVotes += 1;
          } else {
            option.numVotes -= 1;
          }
          updatedOptions.push(option);
        }

        await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          .update({ options: JSON.stringify(updatedOptions) });
      });
    } catch (e) {
      return { updatedVote: null, deletedStatement: null };
    }
    const vote = await Vote.gen(viewer, data.id, loaders);
    if (vote) {
      EventManager.publish('onVoteUpdated', {
        viewer,
        vote: {
          id: data.id,
          pollId: data.pollId,
          positions: data.positions,
          userId: viewer.id,
          extended: poll.extended,
          ...(poll.extended ? { positionAdded: data.positions[0].value } : {}),
        }, // or save only voteInput
        ...(proposal.workteamId && {
          groupId: proposal.workteamId,
          info: { workteamId: proposal.workteamId },
        }),
      });
    }
    if (deletedStatement) {
      EventManager.publish('onStatementDeleted', {
        viewer,
        subjectId: proposal.id,
        statement: deletedStatement,
        ...(proposal.workteamId && {
          groupId: proposal.workteamId,
          info: { workteamId: proposal.workteamId },
        }),
      });
    }
    return {
      updatedVote: vote,
      deletedStatement,
    };
  }

  static async create(viewer, data, loaders) {
    // authenticate later?
    // throw Error('TESTERROR');
    // validate
    if (!data.pollId) return null;
    const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);

    if (!canMutate(viewer, { ...data, proposal }, Models.VOTE)) return null;

    if (!proposal || !(await proposal.isVotable(viewer))) return null;

    let newVoteId;
    let poll;
    try {
      let positions = JSON.stringify(data.positions);
      newVoteId = await knex.transaction(async trx => {
        const [pollData] = await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          .select(); // Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
        poll = new Poll(pollData);
        if (!poll || !poll.isVotable()) throw new Error('Poll error');
        if (await poll.isUnipolar(viewer, loaders)) {
          positions = JSON.stringify([{ pos: 0, value: 1 }]);
        }
        /*    const voteInDB = await knex('votes') // TODO prob. superflue bc constraint
          .transacting(trx)
          .forUpdate()
          .where({ poll_id: data.pollId, user_id: viewer.id })
          .pluck('id');
        if (voteInDB.length !== 0) throw Error('Already voted!'); */
        const id = await knex('votes')
          .transacting(trx)
          .forUpdate()
          .insert(
            {
              user_id: viewer.id,
              poll_id: data.pollId,
              positions,
              created_at: new Date(),
            },
            'id',
          );
        if (id.length === 0) throw Error('No Id returned');
        // update votecount;
        // TODO these updates are sequential - can db-ops be parallel in transactions?

        const updatedOptions = [];
        // better allow only one position?
        for (let i = 0; i < poll.options.length; i += 1) {
          const option = poll.options[i];
          if (option.pos === data.positions[0].pos && data.positions[0].value) {
            option.numVotes += 1;
          }
          updatedOptions.push(option);
        }
        await knex('polls')
          .transacting(trx)
          .forUpdate()
          .where({ id: data.pollId })
          // OR with jsonb?
          // https://stackoverflow.com/questions/25957937/how-to-increment-value-in-postgres-update-statement-on-json-key
          // SET data = jsonb_set(data, '{bar}', (COALESCE(data->>'bar','0')::int + 1)::text::jsonb)
          .update({
            num_votes: poll.numVotes + 1,
            options: JSON.stringify(updatedOptions),
          });
        return id[0];
      });
    } catch (e) {
      return null;
    }
    if (!newVoteId) return null;
    const newVote = await Vote.gen(viewer, newVoteId, loaders);
    if (newVote) {
      EventManager.publish('onVoteCreated', {
        viewer,
        vote: { ...newVote, extended: poll.extended },

        ...(proposal.workteamId && {
          groupId: proposal.workteamId,
          info: { workteamId: proposal.workteamId },
        }),
      });
    }
    return newVote;
  }
}

export default Vote;
