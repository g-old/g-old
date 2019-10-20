import log from '../logger';

export const feedOptions = [
  {
    resourceName: 'proposal',
    events: [
      { eventType: 'create', mainFeed: true, systemFeed: true },
      { eventType: 'update', mainFeed: true, systemFeed: true },
    ],
  },
  {
    resourceName: 'vote',
    events: [
      { eventType: 'create', personalFeed: true },
      { eventType: 'update', personalFeed: true },
      { eventType: 'delete', personalFeed: true },
    ],
    contentModifier: (resource, info) => ({
      ...resource,
      workteamId: info.workteamId,
    }),
  },
  {
    resourceName: 'request',
    events: [{ eventType: 'create', personalFeed: true }],
  },
  {
    resourceName: 'user',
    events: [{ eventType: 'update', personalFeed: true }],
  },
  {
    resourceName: 'message',
    events: [{ eventType: 'create', personalFeed: true }],
  },
  {
    resourceName: 'statement',
    events: [
      { eventType: 'create', systemFeed: true, personalFeed: true },
      { eventType: 'update', personalFeed: true },
      { eventType: 'delete', systemFeed: true, personalFeed: true },
    ],
    contentModifier: (resource, info) => ({
      ...resource,
      workteamId: info.workteamId,
    }),
  },
  {
    resourceName: 'discussion',
    events: [
      { eventType: 'create', mainFeed: true, systemFeed: true },
      { eventType: 'update', mainFeed: true, systemFeed: true },
      { eventType: 'delete', mainFeed: true, systemFeed: true },
    ],
  },
  {
    resourceName: 'comment',
    events: [
      { eventType: 'create', systemFeed: true, personalFeed: true },
      { eventType: 'update', personalFeed: true },
      { eventType: 'delete', systemFeed: true, personalFeed: true },
    ],
    contentModifier: (resource, info) => ({
      ...resource,
      workteamId: info.workteamId,
    }),
  },
];

const capitalizeFirstLetter = name =>
  name.charAt(0).toUpperCase() + name.substring(1);

/* const lowerFirstLetter = name => {
  return name.charAt(0).toLowerCase() + name.substring(1);
}; */

const createEventname = (resourceName, eventName) =>
  `on${capitalizeFirstLetter(resourceName)}${capitalizeFirstLetter(
    eventName,
  )}d`;

class ActivityService {
  constructor(props, resourcePresets) {
    if (!props.dbConnector) {
      throw new Error('Db connection needed!');
    }
    if (!props.eventSrc) {
      throw new Error('Event source needed!');
    }
    if (!props.activityStore) {
      throw new Error('Activity store needed!');
    }
    this.db = props.dbConnector;
    this.eventSrc = props.eventSrc;
    this.store = props.activityStore;
    this.MAX_FEED_LENGTH = props.maxFeedLength || 30;
    if (resourcePresets) {
      this.registerResources(resourcePresets);
    }
  }

  registerResources(options) {
    options.map(presets => this.register(presets));
  }

  register(resource) {
    if (this.checkPreset(resource)) {
      resource.events.map(event =>
        this.subscribe(event, resource.resourceName, resource.contentModifier),
      );
    } else {
      throw new Error('Preset format wrong: ', resource);
    }
  }
  // eslint-disable-next-line
  checkPreset(option) {
    return option.resourceName && option.events.length;
  }

  subscribe(event, resourceName, modifier) {
    this.eventSrc.subscribe(
      createEventname(resourceName, event.eventType),
      this.createListener(event, resourceName, modifier),
    );
  }

  createListener(event, resourceType, modifier) {
    const feedField = event.mainFeed ? 'main_activities' : 'activities';

    return async payload => {
      const groupId = payload.groupId || 1;
      // TODO  change when implementing groups !
      const groupType = payload.groupId ? 'WT' : 'GROUP';
      const activityData = {
        type: resourceType,
        content: modifier
          ? modifier(payload[resourceType], payload)
          : payload[resourceType],
        objectId: payload[resourceType] && payload[resourceType].id,
        verb: event.eventType,
        workteamId: payload.groupId,
        subjectId: payload.subjectId,
      };
      try {
        const newActivity = await this.store.create(
          payload.viewer,
          activityData,
        );
        if (event.systemFeed) {
          await this.updateSystemFeed(
            newActivity.id,
            feedField,
            groupId,
            groupType,
          );
        }
        if (event.personalFeed) {
          await this.updateUserFeed(newActivity.id, payload.viewer.id);
        }
      } catch (err) {
        // TODO implement retry
        log.error({ err, payload }, 'ActivityService failed!');
      }
    };
  }

  updateUserFeed(activityId, userId) {
    return this.updateFeed('feeds', 'activity_ids', activityId, {
      user_id: userId,
    });
  }

  updateSystemFeed(activityId, fieldName, groupId, type) {
    return this.updateFeed('system_feeds', fieldName, activityId, {
      group_id: groupId,
      type,
    });
  }

  async updateFeed(tableName, fieldName, activityId, selector) {
    const [activityList = null] = await this.db(tableName)
      .where(selector)
      .select(fieldName, 'id');
    let list = [];
    if (activityList) {
      list = activityList[fieldName];
    } else {
      return this.db(tableName).insert({
        ...selector,
        [fieldName]: JSON.stringify([activityId]),
        created_at: new Date(),
      });
    }
    while (list.length >= this.MAX_FEED_LENGTH) {
      list.shift();
    }
    list.push(activityId);
    await this.db(tableName)
      .where({ id: activityList.id })
      .update({
        [fieldName]: JSON.stringify(list),
        updated_at: new Date(),
      });

    return true;
  }
}

export default ActivityService;
