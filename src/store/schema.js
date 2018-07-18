import { schema } from 'normalizr';

export const user = new schema.Entity('users');

user.define({});

export const log = new schema.Entity('logs', {
  actor: user,
});

export const userList = [user];

/* GENERATOR */
