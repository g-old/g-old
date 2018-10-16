declare type ID = string | number;
declare type Locale = 'de-DE' | 'it-IT' | 'lld-IT';
declare type PositionShape = { pos: number, value: number };
declare type LocalisationShape = {
  de?: string,
  it?: string,
  lld?: string,
  _default?: string,
};

declare type OptionShape = {
  pos: number,
  description: LocalisationShape,
  numVotes: number,
};
declare type ProposalStateType =
  | 'voting'
  | 'proposed'
  | 'accepted'
  | 'rejected'
  | 'revoked'
  | 'deleted'
  | 'survey'
  | 'pending';

declare type PollingModeShape = {
  id: ID,
  withStatements?: boolean,
  secret?: boolean,
  threshold?: number,
  thresholdRef?: 'all' | 'voters',
  unipolar?: boolean,
};

declare type PollShape = {
  id: ID,
  secret?: boolean,
  threshold: number,
  allVoters: number,
  startTime: string,
  endTime: string,
  closedAt?: string,
  extended?: boolean,
  multipleChoice?: boolean,
  options: OptionShape[],
  numVotes: number,
  mode: PollingModeShape,
};
declare type UserShape = {
  id: ID,
  thumbnail: string,
  name: string,
  surname: string,
};

declare type ViewerShape = {
  ...UserShape,
};

declare type VoteShape = {
  id: ID,
  pollId: ID,
  voter: UserShape,
  positions: PositionShape[],
};

declare type UpdatesShape = {
  pending: boolean,
  error: ?string,
  success: boolean,
};

declare type ProposalShape = {
  id: ID,
  workTeamId?: ID,
  state: ProposalStateType,
  pollOne: PollShape,
  pollTwo?: PollShape,
  title: string,
  body: string,
};
