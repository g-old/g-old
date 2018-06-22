import { schema } from 'normalizr';

export const role = new schema.Entity('roles');
export const user = new schema.Entity('users');
export const message = new schema.Entity('messages');

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
export const subscription = new schema.Entity('subscriptions', {
  user,
});
export const proposal = new schema.Entity('proposals', {
  author: user,
  pollOne: poll,
  pollTwo: poll,
  tags: [tag],
  subscription,
});
export const proposalStatus = new schema.Entity('proposalStatus', {
  proposal,
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
  subscription,
});
export const workTeam = new schema.Entity('workTeams', {
  coordinator: user,
  members: [user],
  ownStatus: {
    request,
  },
  discussions: [discussion],
  requests: [request],
  proposals: [proposal],
  linkedProposals: [proposalStatus],
});
export const recipient = new schema.Union(
  {
    User: user,
    WorkTeam: workTeam,
  },
  '__typename',
);
message.define({
  sender: user,
  recipients: [recipient],
  parents: [message],
  replies: [message],
});

export const unionSchema = new schema.Union(
  {
    ProposalDL: proposal,
    VoteDL: vote,
    StatementDL: statement,
    Message: message,
    Comment: comment,
    Discussion: discussion,
    Request: request,
    User: user,
  },
  '__typename',
);

export const activity = new schema.Entity('activities', {
  actor: user,
  object: unionSchema,
});
export const notification = new schema.Entity('notifications', {
  activity,
});
user.define({
  role,
  followees: [user],
  workTeams: [workTeam],
  requests: [request],
  notifications: [notification],
  // messagesSent: [message],
  // messagesReceived: [message],
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
export const workTeamList = [workTeam];
export const logList = [log];
export const discussionList = [discussion];
export const commentList = [comment];
export const requestList = [request];
export const subscriptionList = [subscription];
export const notificationList = [notification];
export const messageList = [message];

/* GENERATOR */
