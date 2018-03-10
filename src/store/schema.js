import { schema } from 'normalizr';

export const role = new schema.Entity('roles');
export const user = new schema.Entity('users');
export const request = new schema.Entity('requests', {
  requester: user,
  processor: user,
});

export const pollingMode = new schema.Entity('pollingModes');
export const vote = new schema.Entity('votes', {
  voter: user,
});
export const statementLike = new schema.Entity('statementLikes');

export const statement = new schema.Entity('statements', {
  author: user,
  vote,
});
export const flaggedStatement = new schema.Entity('flaggedStatements', {
  flagger: user,
  flaggedUser: user,
  solver: user,
  statement,
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
export const tag = new schema.Entity('tags');

export const proposal = new schema.Entity('proposals', {
  author: user,
  pollOne: poll,
  pollTwo: poll,
  tags: [tag],
});
export const proposalStatus = new schema.Entity('proposalStatus', {
  proposal,
});
export const group = new schema.Entity('groups', {
  coordinator: user,
  members: [user],
  ownStatus: {
    request,
  },
  requests: [request],
  proposals: [proposal],
  linkedProposals: [proposalStatus],
});
user.define({
  role,
  followees: [user],
  groups: [group],
  requests: [request],
});
export const notification = new schema.Entity('notifications', {
  sender: user,
});
export const comment = new schema.Entity('comments');
comment.define({
  author: user,
  replies: [comment],
});

export const discussion = new schema.Entity('discussions', {
  author: user,
  comments: [comment],
  ownComment: comment,
});

export const unionSchema = new schema.Union(
  {
    ProposalDL: proposal,
    VoteDL: vote,
    StatementDL: statement,
    Notification: notification,
    Comment: comment,
    Discussion: discussion,
    Request: request,
  },
  '__typename',
);
export const activity = new schema.Entity('activities', {
  actor: user,
  object: unionSchema,
});
export const log = new schema.Entity('logs', {
  actor: user,
});

export const proposalList = [proposal];
export const voteList = [vote];
export const userList = [user];
export const flaggedStatementArray = [flaggedStatement];
export const activityArray = [activity];
export const tagArray = [tag];
export const statementArray = [statement];
export const groupList = [group];
export const logList = [log];
export const discussionList = [discussion];
export const commentList = [comment];

export const requestList = [request];
/* GENERATOR */
