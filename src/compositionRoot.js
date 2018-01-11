import knex from './data/knex';
import ActivityRepo from './data/models/Activity';
import EventManager from './core/EventManager';
import ActivityService, { feedOptions } from './core/ActivityService';

export default {
  ActivityService: new ActivityService(
    { dbConnector: knex, eventSrc: EventManager, activityStore: ActivityRepo },
    feedOptions,
  ),
};
