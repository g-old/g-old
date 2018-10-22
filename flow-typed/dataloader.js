// @flow
declare class DataLoader<K, V> {
  constructor(
    batchLoader: (keys: Array<K>) => Promise<Array<V | Error>>,
    options?: {
      batch?: boolean,
      cache?: boolean,
      cacheKeyFn?: (key: any) => any,
      cacheMap?: {
        get(key: K): V | void,
        set(key: K, value: V): any,
        delete(key: K): any,
        clear(): any,
      },
    },
  ): void;
  load(key: K): Promise<V>;
  loadMany(keys: Array<K>): Promise<Array<V>>;
  clear(key: K): this;
  clearAll(): this;
  prime(key: K, value: V): this;
}
type ProposalProps = {
  id: ID,
  author_id: ID,
  title: string,
  body: string,
  votes: number,
  poll_one_id: ID,
  poll_two_id: ID,
  state: ProposalStateType,
  created_at: string,
  spokesman_id: ID,
  notified_at: string,
  work_team_id: ID,
  deleted_at: ?Date,
  updated_at: ?Date,
};

declare type DataLoaders = {
  proposals: DataLoader<ID, ProposalProps>,
};

declare module 'dataloader' {
  declare module.exports: typeof DataLoader;
}
