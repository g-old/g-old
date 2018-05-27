// @flow
// import fs from 'fs';
import { throwIfMissing } from './utils';
import log from '../logger';
import { sendJob } from './childProcess';
// import config from '../config';
import { SubscriptionType, TargetType } from '../data/models/Subscription';
import Activity, { ActivityType, ActivityVerb } from '../data/models/Activity';
import type { tActivityType, tActivityVerb } from '../data/models/Activity';
import MailComposer from './MailComposer';
import { Groups } from '../organization';
import type { CommentProps } from '../data/models/Comment';
import type { ProposalProps } from '../data/models/Proposal';
import type { DiscussionProps } from '../data/models/Discussion';
import type { StatementProps } from '../data/models/Statement';
import type { UserProps } from '../data/models/User';
import type { EmailHTML } from './MailComposer';
import type PubSub from './pubsub';
import type { MessageType } from '../data/models/Message';
// TODO write Dataloaders for batching
// const MESSAGES_DIR = process.env.MESSAGES_DIR || join(__dirname, './messages');

type Referrer = 'push' | 'email';
type EActivity = {
  id: ID,
  verb: tActivityVerb,
  type: tActivityType,
  actorId: ID,
  targetId: ID,
  targetType: ID,
  subjectId?: ID,
  groupId?: ID,
  objectId: ID,
  content: {
    parentId?: ID,
    targetId?: ID,
    targetType?: tActivityType,
    changedField?: string,
    messageType?: MessageType,
    objectId?: ID,
  },
};

type DBTable =
  | 'users'
  | 'activities'
  | 'communications'
  | 'meetings'
  | 'notes'
  | 'proposals'
  | 'statements'
  | 'votes'
  | 'messages'
  | 'discussions'
  | 'comments';

type NotificationType = 'webpush' | 'email';
type Subscriber = {
  id: ID,
  email: string,
  locale: Locale,
  settings: { [tActivityType]: { [NotificationType]: boolean } },
  subscriptionType?: SubscriptionType,
};
type Selector = [TargetType, ID];
type ActivityMap = { [ID]: EActivity };
type SubscriberMap = { [ID]: Subscriber };
type ResourceType =
  | CommentProps
  | ProposalProps
  | DiscussionProps
  | StatementProps
  | UserProps;
type ResourceMap = { [ID]: ResourceType };

type ObjectMap = { [DBTable]: ResourceMap };

type RelevantActivities = { subscriber: Subscriber, activities: EActivity[] };
type GroupedActivityObjects = { [DBTable]: { [ID]: ResourceType } };
type GroupedActivities = {
  bySubject: {
    [string]: {
      activityIds: ID[],
      targetId: ID,
      targetType: TargetType,
      subscribers: Subscriber[],
    },
  },
  byId: ActivityMap,
};
type SubsForActivity = {
  subscriberIds: ID[],
  activity: EActivity,
  subscriberByLocale: { [Locale]: ID[] },
};
export type NotificationSet = {
  activities: { [ID]: SubsForActivity },
  subscriberIds: Set<ID>,
  subscriberById: SubscriberMap,
};
type RawNotification = {
  user_id: ID,
  activity_id: ID,
  created_at: Date,
};

type GroupedNotifications = {
  webpushData: NotificationSet,
  emailData: NotificationSet,
  allObjects: ObjectMap,
  notifications: RawNotification[],
};
export type PushData = {
  body: string,
  link: string,
  title: string,
  tag: tActivityType,
};
type PushMessage = {
  message: PushData,
  receiverIds: ID[],
  activityId: ID,
};

type LocaleDictionary = {
  [Locale]: {
    [string]: { [string]: string } | string,
  },
};

export type PushMessages = PushMessage[];

export type Email = {
  htmlContent: EmailHTML,
  receivers: string[],
};
export type Emails = Email[];
type PayloadType = { activity: EActivity, subjectId?: ID };

// https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/
function interval(func, wait) {
  let stop = false;
  const interv = (function ival(w) {
    function executor() {
      if (!stop) {
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch (e) {
          stop = true;
          throw e;
        }
      }
    }
    return executor;
  })(wait);

  setTimeout(interv, wait);
}

const mapLocale = {
  'de-DE': 'de',
  'it-IT': 'it',
  'lld-IT': 'lld',
};

const filterReplies = (parents, activities) => {
  const result = [];
  parents.forEach(p => {
    activities.forEach(a => {
      // eslint-disable-next-line
      if (a.content.parentId == p.id) {
        result.push(a);
      }
    });
  });
  return result;
};

const mapTypeToTable: { [tActivityType]: DBTable } = {
  [ActivityType.PROPOSAL]: 'proposals',
  [ActivityType.DISCUSSION]: 'discussions',
  [ActivityType.SURVEY]: 'proposals',
  [ActivityType.STATEMENT]: 'statements',
  [ActivityType.COMMENT]: 'comments',
  [ActivityType.MESSAGE]: 'messages',
  [ActivityType.USER]: 'users',
  communication: 'communications',
  meeting: 'meetings',
  note: 'notes',
};
type ShortLocale = 'de' | 'it' | 'lld';
const getTranslatedMessage = (
  subject: { [ShortLocale]: string },
  locale: Locale,
): ?string => {
  if (subject[mapLocale[locale]]) {
    return subject[mapLocale[locale]];
  }
  return subject[Object.keys(subject).find(l => subject[l]) || 'it'];
};

const fillWithData = (
  object: GroupedNotifications,
  transportName: 'webpushData' | 'emailData',
  activity: EActivity,
  user: Subscriber,
): void => {
  const store = object[transportName];
  if (store.activities[activity.id]) {
    store.activities[activity.id].subscriberIds.push(user.id);
    if (store.activities[activity.id].subscriberByLocale[user.locale]) {
      store.activities[activity.id].subscriberByLocale[user.locale].push(
        user.id,
      );
    } else {
      store.activities[activity.id].subscriberByLocale[user.locale] = [user.id];
    }
  } else {
    store.activities[activity.id] = {
      subscriberIds: [user.id],
      activity,
      subscriberByLocale: { [user.locale]: [user.id] },
    };
  }
  store.subscriberIds.add(user.id);
  store.subscriberById[user.id] = user;
};

// const readFile = Promise.promisify(fs.readFile);

const generateData = (
  activities: { [ID]: SubsForActivity },
  objects: ObjectMap,
  subscriberById: SubscriberMap,
  makeFn: (
    activity: EActivity,
    subscriberIds: ID[],
    activityObject: ResourceType,
    locale: Locale,
    subscriberById: SubscriberMap,
    objects: ObjectMap,
  ) => {},
): any => {
  const result = [];
  Object.keys(activities).forEach(activityId => {
    const { activity, subscriberByLocale } = activities[activityId];
    const activityObject =
      objects[mapTypeToTable[activity.type]][activity.objectId];
    Object.keys(subscriberByLocale).forEach(locale => {
      const subscriberIds = subscriberByLocale[locale];
      const data = makeFn(
        activity,
        subscriberIds,
        activityObject,
        locale,
        subscriberById,
        objects,
      );
      result.push(data);
    });
  });
  return result;
};

const emailNotificationTranslations = {
  'de-DE': {
    message: 'hat Ihnen eine Nachricht geschrieben',
    user: 'hat eine Einstellung verändert',
  },
  'it-IT': {
    message: 'Translate: hat Ihnen eine Nachricht geschrieben',
    user: 'Translate: hat eine Einstellung verändert',
  },
  'lld-IT': {
    message: 'Translate: hat Ihnen eine Nachricht geschrieben',
    user: 'Translate: hat eine Einstellung verändert',
  },
};
/*
const userStatusTranslations = {
  'de-DE': {
    roleAdded: (name, role, helpText) => `Hallo ${name},\n
    wird haben Sie als ${role} freigeschalten.\n${helpText}`,
    roleLost: (name, role) => `Hallo ${name},\n
    Sie sind nun nicht mehr ${role}.\n`,
    MODERATOR: 'Als MODERATOR können Sie Beiträge löschen',
    MEMBER_MANAGER: 'Als MEMBER_MANAGER können Sie Mitglieder betreuen ',
    RELATOR:
      'Als RELATOR können Sie Beschlüsse auf der Plattform veröffentlichen',
    VIEWER:
      'Als VIEWER können Sie alle Aktivitäten auf unserer Plattform verfolgen, bei Umfragen abstimmen und mitdiskutieren',
    VOTER: 'Als VOTER haben sie das Recht, bei Beschlüssen abzustimmen',
    subject: 'Wichtig - Ihre Profileinstellungen wurden verändert',
  },

  'it-IT': {
    roleAdded: (name, role, helpText) => `Ciao ${name},\n
    hai ricevuto il profile di ${role}.\n${helpText}`,
    roleLost: (name, role) => `Ciao ${name},\n
    non sei più ${role}.\n`,
    RELATOR:
      'Come RELATOR puoi pubblicare proposte e sondaggi, indire delle votazioni e avviare delle discussioni',
    VIEWER: 'Come VIEWER puoi leggere tutto e partecipare ai sondaggi',
    VOTER: 'Come VOTER puoi leggere, commentare e votare',
    subject: 'Attenzione - il suo profile è stato cambiato',
  },
  'lld-IT': {
    roleAdded: (name, role, helpText) => `Ciao ${name},\n
    hai ricevuto il profile di ${role}.\n${helpText}`,
    roleLost: (name, role) => `Ciao ${name},\n
    non sei più ${role}.\n`,
    RELATOR:
      'Come RELATOR puoi pubblicare proposte e sondaggi, indire delle votazioni e avviare delle discussioni',
    VIEWER: 'Come VIEWER puoi leggere tutto e partecipare ai sondaggi',
    VOTER: 'Come VOTER puoi leggere, commentare e votare',
    subject: 'Attenzione - il tuo profile è stato cambiato',
  },
};
*/
// TODO load translations in
const resourceByLocale: LocaleDictionary = {
  'de-DE': {
    [ActivityType.PROPOSAL]: {
      proposed: 'Neuer Beschluss',
      voting: 'Abstimmung eröffnet',
      revoked: 'Beschluss zurückgezogen',
      rejected: 'Beschluss abgelehnt',
      accepted: 'Beschluss angenommen',
      survey: 'Neue Umfrage',
    },
    [ActivityType.DISCUSSION]: 'Neue Diskussion',
    [ActivityType.SURVEY]: 'Neue Umfrage',
    [ActivityType.COMMENT]: 'Neuer Kommentar',
    [ActivityType.STATEMENT]: 'Neues Statement',
    [ActivityType.MESSAGE]: 'Neue Nachricht',
  },
  'it-IT': {
    [ActivityType.PROPOSAL]: {
      proposed: 'Nuova proposta',
      voting: 'Votazione aperta',
      revoked: 'Proposta ritirata',
      rejected: 'Proposta rigettata',
      accepted: 'Proposta accettata',
      survey: 'Nuovo  sondaggio',
    },
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
  'lld-IT': {
    [ActivityType.PROPOSAL]: {
      proposed: 'Nuova proposta',
      voting: 'Votazione aperta',
      revoked: 'Proposta ritirata',
      rejected: 'Proposta rigettata',
      accepted: 'Proposta accettata',
      survey: 'Nuovo  sondaggio',
    },
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
};

const notifyPredicate = (activity: EActivity, subscriber: Subscriber) => {
  if (activity.actorId !== subscriber.id) {
    if (
      activity.type === ActivityType.USER ||
      activity.verb === ActivityVerb.CREATE
    ) {
      return true;
    }
  }
  return false;
};

const getCommentLink = (
  comment: CommentProps,
  groupId: ID,
  referrer: Referrer,
): string => {
  const parent = comment.parent_id;
  const child = parent ? comment.id : null;

  return `/workteams/${groupId}/discussions/${
    comment.discussion_id
  }?comment=${parent || comment.id}${
    child ? `&child=${child}` : ''
  }&ref=${referrer}&refId=`;
};

const getProposalLink = (
  proposal: ProposalProps,
  referrer: Referrer,
): string => {
  if (proposal.poll_two_id && proposal.poll_one_id) {
    return `/proposal/${proposal.id}/${
      proposal.poll_two_id
    }?ref=${referrer}&refId=`;
  }
  return `/proposal/${proposal.id}/${proposal.poll_two_id ||
    proposal.poll_one_id}?ref=${referrer}&refId=`;
};

const getStatementLink = (proposalId: ID, pollId: ID, referrer: Referrer) =>
  `/proposal/${proposalId}/${pollId}?ref=${referrer}&refId=`;

const getDiscussionLink = (
  discussion: DiscussionProps,
  referrer: Referrer,
): string =>
  `/workteams/${discussion.work_team_id}/discussions/${
    discussion.id
  }?ref=${referrer}&refId=`;

const getMessageLink = (messageId: ID, referrer) =>
  `/message/${messageId}?ref${referrer}&refId=`;

const generatePushMessage = (
  activity: EActivity,
  subscriberIds: ID[],
  activityObject: any,
  locale: Locale,
  subscriberById: SubscriberMap,
  objects: ObjectMap,
): PushMessage => {
  let title;
  let message;
  let link;
  const referrer = 'push';

  switch (activity.type) {
    case ActivityType.SURVEY:
      title = resourceByLocale[locale][activity.type];
      message = activityObject.title;
      // problem if notifieing open votation
      link = getProposalLink(activityObject, referrer);
      break;
    case ActivityType.DISCUSSION:
      title = resourceByLocale[locale][activity.type];
      // problem if notifieing open votation
      message = activityObject.title;
      link = getDiscussionLink(activityObject, referrer);
      break;
    case ActivityType.PROPOSAL:
      // get resources
      title = resourceByLocale[locale][activity.type][activityObject.state];

      message = activityObject.title;

      link = getProposalLink(activityObject, referrer);
      // recipients are data-activities
      break;

    case ActivityType.STATEMENT: {
      const proposal: ProposalProps = (objects.proposals[
        activity.targetId
      ]: any);
      message = proposal.title;
      // Diff between reply and new ?

      title = resourceByLocale[locale][activity.type];
      //
      link = getStatementLink(proposal.id, activityObject.poll_id, referrer);
      break;
    }

    case ActivityType.COMMENT: {
      const discussion: DiscussionProps = (objects.discussions[
        activity.targetId
      ]: any);
      message = discussion.title;
      // Diff between reply and new ?

      title = resourceByLocale[locale][activity.type];
      link = getCommentLink(activityObject, discussion.work_team_id, referrer);
      break;
    }

    case ActivityType.MESSAGE:
      title = resourceByLocale[locale][activity.type];
      link = getMessageLink(activity.objectId, referrer);
      message = getTranslatedMessage(activityObject.subject, locale);
      break;
    default:
      throw new Error(`Type not recognized ${activity.type}`);
  }

  // for each subsriber we save
  // TODO

  /* const activitySubscribers = subscriberByLocale[locale].map(id => {
    const res = subscriptionData.find(
      // eslint-disable-next-line eqeqeq
      subscription => subscription.user_id == id,
    );

    return res;
  }); */

  return {
    message: {
      body: message.length > 40 ? `${message.slice(0, 36)}...` : message,
      title,
      link: link + activity.id,
      tag: activity.type,
    },
    receiverIds: subscriberIds,
    activityId: activity.id,
  };
};

type NotificationProps = {
  maxBatchSize?: number,
  batchingWindow?: number,
  mailComposer: MailComposer,
  pubsub: PubSub,
};

class NotificationService {
  EventManager: {};
  activityQueue: EActivity[];
  delimiter: string;
  maxBatchSize: number;
  batchingWindow: number;
  dbConnector: any;
  PubSub: PubSub;
  linkPrefix: string;
  lastActivityId: ID;
  sendEmails: boolean;
  MailComposer: MailComposer;
  filterActivity: (payload: PayloadType) => void;
  loadSubscriptions: Selector => Promise<Subscriber[]>;
  mergeNotifyableActivitiesWithSubscribers: (
    Subscriber,
    ID[],
    ActivityMap,
  ) => Promise<RelevantActivities>;
  generateEmail: (
    activity: EActivity,
    subscriberIds: ID[],
    activityObject: any,
    locale: Locale,
    subscriberById: SubscriberMap,
    objects: { [tActivityType]: ResourceMap },
  ) => Email;
  batchProcessing: () => void;
  processQueue: () => void;
  start: () => void;
  recover: () => void;
  getLastProcessedActivityId: () => ID;

  constructor({
    eventManager = throwIfMissing('EventManager'),
    dbConnector = throwIfMissing('Database connection'),
    mailComposer = throwIfMissing('MailComposer'),
    pubsub = throwIfMissing('PubSub'),
    // sseEmitter = throwIfMissing('SSE-Emitter'),
    maxBatchSize,
    batchingWindow,
  }: NotificationProps) {
    this.EventManager = eventManager;
    this.dbConnector = dbConnector;
    this.MailComposer = mailComposer;
    this.PubSub = pubsub;
    this.activityQueue = [];
    this.delimiter = '#';
    this.maxBatchSize = maxBatchSize || 500;
    this.batchingWindow = batchingWindow || 1000 * 10;
    // const env = process.env.NODE_ENV || 'development';
    this.sendEmails = true; // env === 'development';
    this.filterActivity = this.filterActivity.bind(this);
    this.loadSubscriptions = this.loadSubscriptions.bind(this);
    this.generateEmail = this.generateEmail.bind(this);

    if (!__DEV__) {
      if (!process.env.HOST) {
        throw new Error('HOST environment variable not set!');
      }
    }
    this.linkPrefix = `${__DEV__ ? 'http' : 'https'}://${process.env.HOST ||
      'localhost:3000'}`;
    this.mergeNotifyableActivitiesWithSubscribers = this.mergeNotifyableActivitiesWithSubscribers.bind(
      this,
    );
    this.processQueue = this.processQueue.bind(this);
    this.batchProcessing = this.batchProcessing.bind(this);
    // this.registerListener();
    // this.processQueue();
  }

  registerListener() {
    this.EventManager.subscribe('onActivityCreated', this.filterActivity);
  }

  /* async loadTranslations() {
   // TODO
    const promises = config.locales.map(async locale => {
      this.translations[locale] = await readFile(
        join(MESSAGES_DIR, `${locale}.json`),
      );
    });
    await Promise.all(promises);
  }
*/
  filterActivity(payload: PayloadType): void {
    let data;
    const { activity, subjectId } = payload;
    switch (activity.type) {
      case ActivityType.STATEMENT:
        if (activity.verb === ActivityVerb.CREATE) {
          activity.targetType = TargetType.PROPOSAL;
          activity.targetId = activity.subjectId || subjectId;
          data = activity;
        }
        break;

      case ActivityType.DISCUSSION: {
        activity.targetType = TargetType.GROUP;
        activity.targetId = activity.subjectId || 0;
        data = activity;
        break;
      }

      case ActivityType.SURVEY: // not used yet
      case ActivityType.PROPOSAL:
        if (activity.verb === ActivityVerb.CREATE) {
          activity.targetType = TargetType.GROUP;
          activity.targetId = activity.subjectId || 0;
        } else {
          activity.targetType = TargetType.PROPOSAL;
          activity.targetId = activity.objectId;
        }
        data = activity;
        break;

      case ActivityType.COMMENT:
        if (activity.verb === ActivityVerb.CREATE) {
          activity.targetType = TargetType.DISCUSSION;
          activity.targetId = activity.subjectId || subjectId;
          data = activity;
        }
        break;

      case ActivityType.MESSAGE:
        if (activity.content.targetType) {
          activity.targetType = activity.content.targetType;
          activity.targetId = activity.subjectId;
          data = activity;
        }
        break;

      /* case ActivityType.USER:
        if (activity.verb === ActivityVerb.UPDATE) {
          if (
            activity.subjectId &&
            activity.content.changedField &&
            activity.content.changedField === 'groups'
          ) {
            activity.targetId = activity.subjectId;
            activity.targetType = TargetType.USER;
            data = activity;
          }
        }
        break; */
      default:
        return;
    }
    // or store compound key?

    // console.log('ACTIVITY', { activity, subjectId });
    if (data) {
      this.activityQueue.push(data);
    }
  }

  groupBySubject(activityMap: ActivityMap): GroupedActivities {
    return Object.keys(activityMap).reduce(
      (acc, id) => {
        const activity = activityMap[id];
        const compoundKey =
          activity.targetType + this.delimiter + activity.targetId;
        if (acc.bySubject[compoundKey]) {
          acc.bySubject[compoundKey].activityIds.push(activity.id);
        } else {
          // eslint-disable-next-line no-param-reassign
          acc.bySubject[compoundKey] = {
            activityIds: [activity.id],
            targetType: activity.targetType,
            targetId: activity.targetId,
          };
        }
        if (!acc.byId[activity.id]) {
          acc.byId[activity.id] = activity;
        }
        return acc;
      },
      { bySubject: {}, byId: {} },
    );
  }

  async start() {
    // subscribe
    this.registerListener();
    await this.initStore();

    // only needed if indipendent service
    await this.recover();

    this.processQueue();
  }

  async initStore() {
    const [data] = await this.dbConnector('store')
      .where({ type: 'inbox' })
      .count('type');
    if (data.count <= 0) {
      await this.dbConnector('store').insert({
        type: 'inbox',
        last_processed_activity_id: 0,
        created_at: new Date(),
      });
    }
  }

  async recover() {
    this.lastActivityId = await this.getLastProcessedActivityId();
    if (this.lastActivityId) {
      await this.loadActivities();
    }
  }

  async getLastProcessedActivityId(): Promise<ID> {
    const [id] = await this.dbConnector('store')
      .where({ type: 'inbox' })
      .limit('1')
      .pluck('last_processed_activity_id');
    return id;
  }

  async loadActivities() {
    const activities = await this.dbConnector('activities')
      .where('id', '>', this.lastActivityId)
      .select('*');
    activities.forEach(activityData => {
      this.filterActivity({ activity: new Activity(activityData) });
    });
  }

  async addSubscribers(
    groupedActivities: GroupedActivities,
  ): Promise<GroupedActivities> {
    const promises = Object.keys(groupedActivities.bySubject).map(async key => {
      const subscribers = await this.loadSubscriptions([
        groupedActivities.bySubject[key].targetType,
        groupedActivities.bySubject[key].targetId,
      ]);
      // eslint-disable-next-line no-param-reassign
      groupedActivities.bySubject[key].subscribers = subscribers;
    });
    await Promise.all(promises);
    return groupedActivities;
  }

  async processQueue() {
    try {
      log.info('Starting batchprocessing');
      interval(this.batchProcessing, this.batchingWindow);
    } catch (err) {
      log.error({ err }, 'NotificationService failed ');
      // means complete batch could be wasted -
      await this.recover();
      this.processQueue();
    }
  }

  async getOnlineUsers() {
    return new Set([...this.PubSub.getOnlineUsers().values()]);
  }

  loadSubscriptions(selector: Selector): Promise<Subscriber[]> {
    switch (selector[0]) {
      case TargetType.GROUP:
        if (selector[1] === 0) {
          // means no group
          // PROPBLEM : ALSO GUESTS GET NOTIFIED!! -if they have notificationsettings
          return this.dbConnector('notification_settings')
            .innerJoin('users', 'users.id', 'notification_settings.user_id')
            .whereRaw('users.groups & ? > 0', [Groups.VIEWER]) // no guests!
            .select(
              'notification_settings.user_id as id',
              'notification_settings.settings as settings',
              'users.locale as locale',
              'users.email as email',
            )
            .then();
        }
        // workteams
        return this.dbConnector('user_work_teams')
          .where({ work_team_id: selector[1] })
          .innerJoin(
            'notification_settings',
            'notification_settings.user_id',
            'user_work_teams.user_id',
          )
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'users.locale as locale',
            'users.email as email',
          );
      case TargetType.USER: // messages, status notifications
        return this.dbConnector('notification_settings')
          .where({ user_id: selector[1] })
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'users.locale as locale',
            'users.email as email',
          );
      case TargetType.PROPOSAL:
      case TargetType.DISCUSSION: {
        return this.dbConnector('subscriptions')
          .where({ target_type: selector[0], target_id: selector[1] })
          .innerJoin(
            'notification_settings',
            'notification_settings.user_id',
            'subscriptions.user_id',
          )
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'subscriptions.subscription_type as subscriptionType',
            'subscriptions.target_type as targetType',
            'subscriptions.target_id as targetId',
            'users.locale as locale',
            'users.email as email',
          );
      }
      default:
        throw new Error(`TargetType not recognized: ${selector[0]}`);
    }
  }

  async loadObjects(data: {
    [DBTable]: Set<ID>,
  }): Promise<GroupedActivityObjects> {
    const allObjects = {};
    const promises = Object.keys(data).map(async type => {
      const objData = await this.dbConnector(type)
        .whereIn('id', [...data[type].values()])
        .select();
      allObjects[type] = objData.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
      }, {});
    });
    await Promise.all(promises);
    //
    return allObjects;
  }

  async batchProcessing() {
    //  const startTime = process.hrtime();
    // console.log('BATCH -activities', this.activityQueue);
    try {
      const activities = this.activityQueue.splice(
        0,
        this.activityQueue.length,
      );
      // makes dictionary
      const activityMap: ActivityMap = activities.reduce((acc, activity) => {
        acc[activity.id] = activity;
        return acc;
      }, {});

      if (Object.keys(activityMap).length) {
        const groupedActivities = this.groupBySubject(activityMap);
        const activitiesAndSubscribers = await this.addSubscribers(
          groupedActivities,
        );

        const notificationData = await this.combineData(
          activitiesAndSubscribers,
        );
        // const counterData = getNotificationsCounts(notificationData);

        // this.sseEmitter.publish('notifications', counterData);

        const {
          notifications,
          webpushData,
          emailData,
          allObjects,
        } = await this.getAndGroupNotifications(notificationData);

        /*  console.log(' NEW GROUPED NOTIFICATIONS', {
          webpushData,
          emailData,
          notifications,
        }); */

        const notificationIds: ID[] = await this.dbConnector
          .batchInsert('notifications', notifications, this.maxBatchSize)
          .returning('id');

        // mark as processed
        const lastId = Math.max(
          ...Object.keys(activityMap).map(id => Number(id)),
        );
        // console.log('LASTID', { lastId });
        await this.dbConnector('store')
          .where({ type: 'inbox' })
          .update({
            last_processed_activity_id: lastId,
            updated_at: new Date(),
          });
        // TODO add notificationIds
        console.info(notificationIds);
        // TODO add nIds to push + emailmessages

        let counter = 0;
        const notificationIdLookup = notifications.reduce(
          (acc, notification) => {
            acc[`${notification.activity_id}$${notification.user_id}`] =
              notificationIds[counter];
            counter += 1;
            return acc;
          },
          {},
        );
        let emails;
        if (this.sendEmails) {
          emails = generateData(
            emailData.activities,
            allObjects,
            emailData.subscriberById,
            this.generateEmail,
          );
        }

        // BETTER on CLIENTSIDE!
        // const onlineSubscribers = this.getOnlineUsers();
        const pushMessages: PushMessages = generateData(
          webpushData.activities,
          allObjects,
          webpushData.subscriberById,
          generatePushMessage,
        );

        await this.notifyPushServices(emails, {
          messages: pushMessages,
          notificationIds: notificationIdLookup,
        });
      }

      // const endTime = process.hrtime(startTime);
      // console.log('PROCESSING TIME:', endTime);

      // TODO

      // SSE all new notifications to active users - only count of new notifications
    } catch (err) {
      // TODO: recover?
      log.error({ err }, err.message);
    }
  }

  async combineData(
    groupedActivities: GroupedActivities,
  ): Promise<RelevantActivities[]> {
    const proms = Object.keys(groupedActivities.bySubject).map(compoundKey => {
      const data = groupedActivities.bySubject[compoundKey];
      const promises = data.subscribers.map(subscriber =>
        this.mergeNotifyableActivitiesWithSubscribers(
          subscriber,
          data.activityIds,
          groupedActivities.byId,
        ),
      );
      return Promise.all(promises);
    });
    const data = await Promise.all(proms);
    return data.reduce((acc, curr) => acc.concat(curr), []);
  }

  async mergeNotifyableActivitiesWithSubscribers(
    subscriber: Subscriber,
    activityIds: ID[],
    allActivities: ActivityMap,
  ): Promise<RelevantActivities> {
    const activities = activityIds.map(aId => allActivities[aId]);
    if (
      !subscriber.subscriptionType ||
      subscriber.subscriptionType === SubscriptionType.ALL
    ) {
      // Proposal state change to voting is filtered out!
      if (!subscriber.subscriptionType) {
        return {
          subscriber,
          activities: activities.filter(a => notifyPredicate(a, subscriber)),
        };
      }
      return {
        subscriber,
        activities: activities.filter(a => a.actorId !== subscriber.id),
      };
    }
    switch (subscriber.subscriptionType) {
      // state updates + followee activitis
      case SubscriptionType.FOLLOWEES: {
        // filter discussions out
        const followeeActivities = activities.filter(
          activity => activity.type === ActivityType.STATEMENT,
        );
        const stateUpdates = activities.filter(
          a =>
            a.verb === ActivityVerb.UPDATE &&
            [
              ActivityType.PROPOSAL,
              ActivityType.DISCUSSION,
              ActivityType.SURVEY,
            ].includes(a.type),
        );
        const followerActivities = await this.checkIfFollowing(
          subscriber,
          followeeActivities,
        );
        return {
          subscriber,
          activities: followerActivities.concat(stateUpdates),
        };
      }

      case SubscriptionType.REPLIES: {
        // for each one which has a parent id get parent comments author...
        const relevantIds = activities
          .filter(
            a => a.type === ActivityType.COMMENT && a.actorId !== subscriber.id,
          )
          .map(a => a.content.parentId);
        // TODO  with Dataloader

        const parents = await this.dbConnector('comments')
          .whereNull('parent_id')
          .whereIn('id', relevantIds)
          .select(['author_id', 'id']);

        const relevantParents = parents.filter(
          // eslint-disable-next-line
          p => p.author_id == subscriber.id,
        );
        return {
          subscriber,
          activities: filterReplies(relevantParents, activities),
        };
      }
      case SubscriptionType.UPDATES: {
        return {
          subscriber,
          activities: activities.filter(
            a =>
              a.verb === ActivityVerb.UPDATE &&
              [
                ActivityType.PROPOSAL,
                ActivityType.DISCUSSION,
                ActivityType.SURVEY,
              ].includes(a.type),
          ),
        };
      }

      default:
        throw new Error(
          `SubscriptionType not recognized ${subscriber.subscriptionType}`,
        );
    }
  }

  generateEmail(
    activity: EActivity,
    subscriberIds: ID[],
    activityObject: any,
    locale: Locale,
    subscriberById: SubscriberMap,
    objects: ObjectMap,
  ): Email {
    const receivers = subscriberIds.map(sId => subscriberById[sId].email);
    const referrer = 'email';
    switch (activity.type) {
      case ActivityType.DISCUSSION: {
        let link = getDiscussionLink(activityObject, referrer);
        link = this.linkPrefix + link + activity.id;
        const text = `${resourceByLocale[locale][ActivityType.DISCUSSION]}: ${
          activityObject.title
        }`;

        const emailHTML = this.MailComposer.getDiscussionMail({
          discussion: activityObject,
          sender: {
            fullName: 'GOLD',
            thumbnail: `${this.linkPrefix}/tile.png`,
          },
          notification: text,
          subject: text,
          link,
          locale,
        });
        return { htmlContent: emailHTML, receivers };
      }
      case ActivityType.SURVEY:
      case ActivityType.PROPOSAL: {
        let link = getProposalLink(activityObject, referrer);
        link = this.linkPrefix + link + activity.id;
        const text = `${
          resourceByLocale[locale][ActivityType.PROPOSAL][activityObject.state]
        }: ${activityObject.title}`;
        const message = this.MailComposer.getProposalMail({
          sender: {
            fullName: 'GOLD',
            thumbnail: `${this.linkPrefix}/tile.png`,
          },
          proposal: activityObject,
          locale,
          notification: text,
          subject: text,
          link,
        });

        return { htmlContent: message, receivers };
      }

      case ActivityType.STATEMENT: {
        // $FlowFixMe
        const proposal: ProposalProps = objects.proposals[activity.targetId];
        // $FlowFixMe
        const author: UserProps = objects.users[activity.actorId];
        let link = getStatementLink(
          proposal.id,
          activityObject.poll_id,
          referrer,
        );
        link = this.linkPrefix + link + activity.id;
        const emailHTML = this.MailComposer.getStatementMail({
          statement: activityObject,
          proposalTitle: proposal.title,
          author: {
            fullName: `${author.name} ${author.surname}`,
            thumbnail: author.thumbnail,
          },
          locale,
          link,
        });
        return { htmlContent: emailHTML, receivers };
      }
      case ActivityType.COMMENT: {
        // $FlowFixMe
        const discussion: DiscussionProps =
          objects.discussions[activity.targetId];
        // $FlowFixMe
        const author: UserProps = objects.users[activity.actorId];

        let link = getCommentLink(
          activityObject,
          discussion.work_team_id,
          referrer,
        );
        link = this.linkPrefix + link + activity.id;
        const emailHTML = this.MailComposer.getCommentMail({
          comment: activityObject,
          author: {
            fullName: `${author.name} ${author.surname}`,
            thumbnail: author.thumbnail,
          },
          discussionTitle: discussion.title,
          locale,
          link,
        });
        return { htmlContent: emailHTML, receivers };
      }
      case ActivityType.MESSAGE: {
        // $FlowFixMe
        const author: UserProps = objects.users[activity.actorId];
        let emailHTML = {
          html: 'An error occured',
          subject: 'System Notification Failure',
        };
        if (activity.content.messageType && activity.content.objectId) {
          const messageObject =
            objects[mapTypeToTable[activity.content.messageType]][
              activity.content.objectId
            ];
          let message;
          if (typeof messageObject.text_html === 'string') {
            message = messageObject.text_html || messageObject.text_raw;
          } else {
            message = getTranslatedMessage(messageObject.text_html, locale);
          }

          emailHTML = this.MailComposer.getMessageMail({
            message: message || 'Error - not message',
            sender: {
              fullName: `${author.name} ${author.surname}`,
              thumbnail: author.thumbnail,
            },
            locale,
            link: this.linkPrefix + getMessageLink(activityObject.id, referrer),
            notification: emailNotificationTranslations[locale][activity.type],
            subject:
              getTranslatedMessage(activityObject.subject, locale) ||
              'Info from GOLD',
          });
        }
        return { htmlContent: emailHTML, receivers };
      }
      /* case ActivityType.USER: {
        const author: UserProps = objects[ActivityType.USER][activity.actorId];
        const role = activity.content.diff[0];
        const helpText = userStatusTranslations[locale][role];
        const message = userStatusTranslations[locale][
          activity.content.added ? 'roleAdded' : 'roleLost'
        ](activityObject.name, activity.content.diff[0], helpText);
        const emailHTML = this.MailComposer.getMessageMail({
          message,
          sender: {
            fullName: `${author.name} ${author.surname}`,
            thumbnail: author.thumbnail,
          },
          locale,
          link: `${this.linkPrefix}/`,
          notification: emailNotificationTranslations[locale][activity.type],
          title: userStatusTranslations[locale].subject,
        });
        return { htmlContent: emailHTML, receivers };
      } */

      default:
        throw new Error(`ActivityType not recognized : ${activity.type}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async notifyPushServices(
    emails?: Emails,
    pushMessages?: {
      messages: PushMessages,
      notificationIds: { [string]: ID },
    },
  ) {
    if (emails) {
      const job = {
        type: 'batchMailing',
        data: emails,
      };
      await sendJob(job);
    }
    if (pushMessages) {
      const job = {
        type: 'batchPushing',
        data: pushMessages,
      };
      await sendJob(job);
    }
  }

  async checkIfFollowing(subscriber: Subscriber, activities: EActivity[]) {
    const followees = await this.dbConnector('user_follows')
      .where({ follower_id: subscriber.id })
      .pluck('followee_id');
    const followeeSet = new Set(followees);
    return activities.filter(activity =>
      followeeSet.has(Number(activity.actorId)),
    );
  }

  async getAllActivityObjects(
    emailData: NotificationSet,
    webpushData: NotificationSet,
  ): Promise<GroupedActivityObjects> {
    const allActivities: SubsForActivity[] = Object.keys(emailData.activities)
      .map(id => emailData.activities[id])
      .concat(
        Object.keys(webpushData.activities).map(
          id => webpushData.activities[id],
        ),
      );

    const groupedByType: {
      [DBTable]: Set<ID>,
    } = allActivities.reduce((acc, activityData) => {
      const { activity } = activityData;
      acc[mapTypeToTable[activity.type]] = (
        acc[activity.type] || new Set()
      ).add(activity.objectId);

      if (activity.type === ActivityType.STATEMENT) {
        // get subjectId from activity
        // add it to types to load
        if (acc.proposals) {
          acc.proposals.add(activity.targetId);
        } else {
          acc.proposals = new Set([activity.targetId]);
        }
        if (acc.users) {
          acc.users.add(activity.actorId);
        } else {
          acc.users = new Set([activity.actorId]);
        }
      } else if (activity.type === ActivityType.COMMENT) {
        // add it to types to load
        if (acc.discussions) {
          acc.discussions.add(activity.targetId);
        } else {
          acc.discussions = new Set([activity.targetId]);
        }
        if (acc.users) {
          acc.users.add(activity.actorId);
        } else {
          acc.users = new Set([activity.actorId]);
        }
      } else if (activity.type === ActivityType.MESSAGE) {
        // load actor
        if (acc.users) {
          acc.users.add(activity.actorId);
        } else {
          acc.users = new Set([activity.actorId]);
        }
        // load messageObject
        const objectType = mapTypeToTable[activity.content.messageType];
        const { objectId } = activity.content;
        if (acc[objectType]) {
          acc[objectType].add(objectId);
        } else {
          acc[objectType] = new Set([objectId]);
        }
      } else if (activity.type === ActivityType.USER) {
        if (acc.users) {
          acc.users.add(activity.actorId);
        } else {
          acc.users = new Set([activity.actorId]);
        }
      }

      return acc;
    }, {});
    return this.loadObjects(groupedByType);
  }

  // eslint-disable-next-line class-methods-use-this
  async getAndGroupNotifications(
    notificationData: RelevantActivities[],
  ): Promise<GroupedNotifications> {
    const now = new Date();
    const resultSet = {
      emailData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        allObjects: {},
      },
      webpushData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        allObjects: {},
      },
      notifications: [],
      allObjects: {},
    };

    notificationData.forEach(data => {
      if (data.subscriber && data.activities) {
        const user = data.subscriber;
        data.activities.forEach(activity => {
          resultSet.notifications.push({
            user_id: user.id,
            activity_id: activity.id,
            created_at: now,
          });
          const { settings } = user;
          /* if (
            activity.type === ActivityType.USER &&
            activity.verb === ActivityVerb.UPDATE
          ) {
            // notify via mail - also without subscription
            fillWithData(resultSet, 'emailData', activity, user);
          } */
          if (settings[activity.type]) {
            // TODO normalize activities with Map aId: a, aId: [userIds]

            if (settings[activity.type].email) {
              fillWithData(resultSet, 'emailData', activity, user);
            }
            // allow both notification methods combined
            if (settings[activity.type].webpush) {
              fillWithData(resultSet, 'webpushData', activity, user);
            }
          }
        });
      }
    });

    const allObjects = await this.getAllActivityObjects(
      resultSet.emailData,
      resultSet.webpushData,
    );

    // split allobjects ? or make final data here and send only results?
    resultSet.allObjects = allObjects;
    return resultSet;
  }
}

export default NotificationService;
