import { schema } from 'normalizr';

export const user = new schema.Entity('users');
export const pollingMode = new schema.Entity('pollingModes');
export const vote = new schema.Entity('votes', {
  voter: user,
});
export const statementLike = new schema.Entity('statementLikes');


export const statement = new schema.Entity('statements', {
  author: user,
  vote,
});

export const poll = new schema.Entity('polls', {
  author: user,
  statements: [statement],
  mode: pollingMode,
  votes: [vote],
  ownVote: vote,
  ownStatement: statement,
  followees: [vote],
  likedStatements: [statementLike],
});
export const proposal = new schema.Entity('proposals', {
  author: user,
  pollOne: poll,
  pollTwo: poll,
});
