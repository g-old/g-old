/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import User from '../models/User';
import { clearDB, createTestActor, createTestUser } from '../../../test/utils';

jest.setTimeout(10000);

describe('User Model', () => {
  beforeEach(() => clearDB());
  describe('User.gen', () => {
    test('Should allow a user to get all the data about himself', async () => {
      const id = 1;
      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const actor = createTestActor({ id });
      const user = await User.gen(actor, testUser.id, createLoaders());
      expect(user).toEqual(
        expect.objectContaining({
          id: testUser.id,
          email: testUser.email,
        }),
      );
    });
  });

  describe('User.create', () => {
    test('Should allow the system to create a new user', async () => {
      const testUserData = { ...createTestUser(), password: 'password' };
      const actor = createTestActor({ id: 2, groups: Groups.SYSTEM });
      const user = await User.create(actor, testUserData, createLoaders());
      expect(user).toEqual(
        expect.objectContaining({ name: testUserData.name }),
      );
    });
  });

  describe('User.update', () => {
    test('Should not update own users email if not valid', async () => {
      const id = 1;

      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const testActor = createTestActor({ id });
      const update = { id: testUser.id, email: 'wrongmail' };
      const result = await User.update(testActor, update, createLoaders());
      expect(result.user).toBe(undefined);
      expect(result.errors).toContain('Wrong argument');
    });
    test('Should update both name and surname ', async () => {
      const id = 2;
      const testName = 'newName';
      const testSurname = 'newSurname';

      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const testActor = createTestActor({ id });
      const update = { id: testUser.id, name: testName, surname: testSurname };
      const result = await User.update(testActor, update, createLoaders());
      expect(result.user).toBeDefined();
      expect(result.user).toEqual(
        expect.objectContaining({ name: testName, surname: testSurname }),
      );
    });

    it('Should not allow self-following', async () => {
      const ID = 3;
      const testUser = createTestUser({ id: ID, email: 'das@qwert.qw' });

      await knex('users').insert(testUser);
      const testActor = createTestActor({ id: ID });
      const update = { id: testUser.id, followee: testUser.id };
      const result = await User.update(testActor, update, createLoaders());
      expect(result.user).toBeNull();
      expect(result.errors).toContain('Permission denied');

      const followees = await User.followees(testActor, ID, createLoaders());
      expect(followees).toBeDefined();
      expect(followees.length).toBe(0);
    });
  });

  describe('User.delete', () => {
    it('Should delete only users in the group GUEST', async () => {
      const testUser = createTestUser({ groups: Groups.VIEWER });
      const testUserToDelete = createTestUser({
        email: '123@mail.de',
        groups: Groups.GUEST,
      });
      const [uID, udID] = await knex('users')
        .insert([testUser, testUserToDelete])
        .returning('id');
      const testActor = createTestActor({
        groups: Groups.MEMBER_MANAGER,
      });

      const maybeDeleteResult = await User.delete(
        testActor,
        { userId: udID },
        createLoaders(),
      );
      expect(maybeDeleteResult.user).toBeDefined();
      expect(maybeDeleteResult.user).toEqual(
        expect.objectContaining({ id: udID }),
      );

      const [maybeDeletedId] = await knex('users')
        .where({ id: udID })
        .select('id');

      expect(maybeDeletedId).not.toBeDefined();
      const maybeFailResult = await User.delete(
        testActor,
        { userId: uID },
        createLoaders(),
      );
      expect(maybeFailResult.user).toBeNull();
      expect(maybeFailResult.errors).toContain('Permission denied');

      const [maybeFailId] = await knex('users')
        .where({ id: uID })
        .select('id');
      expect(maybeFailId.id).toBe(uID);
    });

    it('Should delete user if he is referenced in token tables', async () => {
      const testUserToDelete = createTestUser();
      const [uID] = await knex('users')
        .insert([testUserToDelete])
        .returning('id');

      const testTokenData = { user_id: uID, token_expires: new Date() };
      await knex('reset_tokens').insert(testTokenData);
      await knex('verify_tokens').insert({
        ...testTokenData,
        email: testUserToDelete.email,
      });

      const testActor = createTestActor({
        groups: Groups.MEMBER_MANAGER,
      });
      const maybeDeleteResult = await User.delete(
        testActor,
        { userId: uID },
        createLoaders(),
      );
      expect(maybeDeleteResult.user).toBeDefined();
      expect(maybeDeleteResult.user).toEqual(
        expect.objectContaining({ id: uID }),
      );

      const [maybeDeleteId] = await knex('verify_tokens')
        .where({ email: testUserToDelete.email })
        .select('id');

      expect(maybeDeleteId).not.toBeDefined();
    });
  });
});
