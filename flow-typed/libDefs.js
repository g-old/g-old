declare type ID = string | number;
declare type Locale = 'de-DE' | 'it-IT' | 'lld-IT';
declare type PositionShape = { pos: number, value: number };
declare type UserShape = {
  id: ID,
  thumbnail: string,
  name: string,
  surname: string,
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
