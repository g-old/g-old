import handlebars from 'handlebars';
import knex from './data/knex';
import ActivityRepo from './data/models/Activity';
import EventManager from './core/EventManager';
import ActivityService, { feedOptions } from './core/ActivityService';
import MailComposer from './core/MailComposer';

export default {
  ActivityService: new ActivityService(
    { dbConnector: knex, eventSrc: EventManager, activityStore: ActivityRepo },
    feedOptions,
  ),
  MailComposer: new MailComposer(handlebars),
};
