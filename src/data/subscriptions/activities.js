import ActivityType from '../types/ActivityType';
import Activity from '../models/Activity';

const activities = {
  type: ActivityType,

  resolve: async (fromEvent, args, { viewer, loaders /* pubsub */ }) => {
    const activity = await Activity.gen(viewer, fromEvent.id, loaders);
    return activity;
  } /* ({
    subscribe: pubsub.asyncIterator('activities'),

  }), */,
};

export default activities;
