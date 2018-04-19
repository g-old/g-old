import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import Proposal from '../data/models/Proposal';
import { circularFeedMessage } from './feed';
import createLoaders from '../data/dataLoader';
import root from '../compositionRoot';
import { EmailType } from './BackgroundService';
import { ActivityType } from '../data/models/Activity';

const handleMessages = async (viewer, messageData, receiver) =>
  circularFeedMessage({
    viewer,
    data: messageData,
    verb: 'create',
    receiver,
    loaders: createLoaders(),
  });

const push = async (subscriptionData, msg) => {
  let result;
  try {
    const subscriptions = subscriptionData.map(s => ({
      endpoint: s.endpoint,
      keys: { auth: s.auth, p256dh: s.p256dh },
    }));

    const messages = subscriptions.map(sub =>
      webPush
        .sendMessage(
          sub,
          JSON.stringify({
            body: msg.body,
            link: msg.link,
            title: msg.title,
            tag: msg.tag,
          }),
        )
        .then(response => {
          log.info({ pushService: response });
          if (response.statusCode !== 201) {
            log.warn({ pushService: response });
          }
        })
        .catch(err => {
          if (err.statusCode === 410) {
            log.error({ pushService: err }, 'Subscription should be deleted');
            return knex('webpush_subscriptions')
              .where({ endpoint: sub.endpoint })
              .del();
          }
          log.error(err, 'Subscription no longer valid');
          return Promise.resolve();
        }),
    );

    result = await Promise.all(messages);
  } catch (e) {
    log.error({ err: e }, 'Message failed');
  }
  return result;
};

const notifyNewStatements = async (viewer, data, loaders) => {
  // check proposal
  const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);
  if (!proposal) return null;
  if (proposal.notifiedAt) {
    if (
      new Date(proposal.notifiedAt).getTime() >
      new Date().getTime() - 60 * 60 * 1000
    ) {
      return null;
    }
  }

  const subscriptionData = await knex
    .from('proposal_user_subscriptions')
    .where({ proposal_id: proposal.id })
    .innerJoin(
      'webpush_subscriptions',
      'proposal_user_subscriptions.user_id',
      'webpush_subscriptions.user_id',
    )
    .where('webpush_subscriptions.user_id', '!=', viewer.id)
    .select();

  const body =
    proposal.title.length > 40
      ? `${proposal.title.slice(0, 36)}...`
      : proposal.title;
  await push(subscriptionData, {
    body,
    link: `/proposal/${proposal.id}/${data.pollId}`,
    title: 'NEW Statements!',
    tag: 'statements',
  });

  const now = new Date();
  return knex('proposals')
    .where({ id: proposal.id })
    .update({ notified_at: now, updated_at: now });
};

const notifyProposalCreation = async proposal => {
  let subscriptionData;
  if (proposal.workTeamId) {
    subscriptionData = await knex('webpush_subscriptions')
      .innerJoin(
        'user_work_teams',
        'webpush_subscriptions.user_id',
        'user_work_teams.user_id',
      )
      .where('user_work_teams.work_team_id', '=', proposal.workTeamId)
      .select();
  } else {
    subscriptionData = await knex('webpush_subscriptions').select();
  }
  const body =
    proposal.title.length > 40
      ? `${proposal.title.slice(0, 36)}...`
      : proposal.title;
  const pollId = proposal.pollTwo_id
    ? proposal.pollTwo_id
    : proposal.pollOne_id;
  return push(subscriptionData, {
    body,
    link: `/proposal/${proposal.id}/${pollId}`,
    title: 'NEW Proposal!',
    tag: 'proposal',
  });
};

const resourceByLocale = {
  'de-DE': {
    [ActivityType.PROPOSAL]: 'Neuer Beschluss',
    [ActivityType.DISCUSSION]: 'Neue Diskussion',
    [ActivityType.SURVEY]: 'Neue Umfrage',
    [ActivityType.COMMENT]: 'Neuer Kommentar',
    [ActivityType.STATEMENT]: 'Neues Statement',
    [ActivityType.MESSAGE]: 'Neue Nachricht',
  },
  'it-IT': {
    [ActivityType.PROPOSAL]: 'Nuova proposta',
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
  'lld-IT': {
    [ActivityType.PROPOSAL]: 'Nuova proposta',
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
};

const getProposalLink = proposal => {
  if (proposal.poll_two_id && proposal.poll_one_id) {
    return `/proposal/${proposal.poll_one_id}/${proposal.poll_two_id}`;
  }
  return `/proposal/${proposal.poll_two_id || proposal.poll_one_id}`;
};

const getCommentLink = (comment, groupId) => {
  const parent = comment.parent_id;
  const child = parent ? comment.id : null;

  return `/workteams/${groupId}/discussions/${
    comment.discussion_id
  }?comment=${parent || comment.id}${child ? `&child=${child}` : ''}`;
};

// from :http://learnjsdata.com/combine_data.html
function join(lookupTable, mainTable, lookupKey, mainKey, select) {
  const l = lookupTable.length;
  const m = mainTable.length;
  const lookupIndex = [];
  const output = [];
  // eslint-disable-next-line
  for (let i = 0; i < l; i++) {
    // loop through l items
    const row = lookupTable[i];
    lookupIndex[row[lookupKey]] = row; // create an index for lookup table
  }
  // eslint-disable-next-line
  for (let j = 0; j < m; j++) {
    // loop through m items
    const y = mainTable[j];
    const x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
    output.push(select(y, x)); // select only the columns you need
  }
  return output;
}

const notifyMultiple = async data => {
  // group by type&locale - get diff message by type , diff link

  // get resources title for proposals
  // load objects

  const mapTypeToTable = {
    [ActivityType.PROPOSAL]: 'proposals',
    [ActivityType.DISCUSSION]: 'discussions',
    [ActivityType.SURVEY]: 'proposals',
    [ActivityType.STATEMENT]: 'statements',
    [ActivityType.COMMENT]: 'comments',
    [ActivityType.MESSAGE]: 'messages',
  };

  //

  const groupedByType = Object.keys(data.activities).reduce(
    (acc, activityId) => {
      (acc[data.activities[activityId].type] =
        acc[data.activities[activityId].type] || new Set()).add(
        data.activities[activityId].objectId,
      );
      return acc;
    },
    {},
  );
  const allObjects = {};
  const promises = Object.keys(groupedByType).map(async type => {
    const objData = await this.dbConnector(mapTypeToTable[type])
      .whereIn('id', groupedByType[type].values())
      .select();
    allObjects[type] = objData.reduce((acc, obj) => {
      acc[obj.id] = obj;
      return obj;
    }, {});
  });
  await Promise.all(promises);
  //

  //

  const userIds = data.subscriberIds.values();
  const subscriptionData = await knex('subscriptions')
    .whereIn('user_id', userIds)
    .select();

  let message;
  let title;
  let locale;
  let link;

  Object.keys(data.activities).map(activityId => {
    const { activity } = data.activities[activityId];
    const object = allObjects[activity.type][activity.objectId];
    switch (activity.type) {
      case ActivityType.SURVEY:
        title = resourceByLocale[locale][activity.type];
        message = object.title;
        // problem if notifieing open votation
        link = getProposalLink(object);
        break;
      case ActivityType.DISCUSSION:
        title = resourceByLocale[locale][activity.type];
        // problem if notifieing open votation
        message = object.title;

        link = `/workteams/${object.work_team_id}/discussions/${object.id}`;
        break;
      case ActivityType.PROPOSAL:
        // get resources

        title = resourceByLocale[locale][activity.type];
        message = object.title;

        link = getProposalLink(object);
        // recipients are data-activities
        break;

      case ActivityType.STATEMENT:
        message = 'Dont know how to get';
        // Diff between reply and new ?

        title = resourceByLocale[locale][activity.type];
        link = getCommentLink(object, 'Noidea');
        break;

      case ActivityType.COMMENT:
        message = 'Dont know how to get';
        // Diff between reply and new ?

        title = resourceByLocale[locale][activity.type];
        link = getCommentLink(object, 'Noidea');
        break;

      case ActivityType.MESSAGE:
        title = resourceByLocale[locale][activity.type];
        link = `/message/${activity.objectId}`;
        break;
      default:
        throw new Error(`Type not recognized ${activity.type}`);
    }
    // TODO
    const activitySubscribers = join(subscriptionData); // data.activities[activityId].subscribers.filter(sId => ).find(sData => sData.user_id == )

    return push(activitySubscribers, {
      body: message.length > 40 ? `${message.slice(0, 36)}...` : message,
      link,
      title,
      tag: activity.type,
    });
  });

  // get subdata - for all, 1 query

  // split in groups dh by activity
};

async function processMessages(message) {
  log.info({ message }, 'Job received');
  let result = null;
  try {
    switch (message.type) {
      case 'webpush': {
        log.info('Starting webpush');

        result = notifyProposalCreation(message.data);

        break;
      }
      case 'webpushforstatementsTEST': {
        log.info('Starting webpush');
        result = notifyNewStatements(
          message.viewer,
          message.data,
          createLoaders(),
        );

        break;
      }
      case 'batchPushing': {
        log.info('Starting webpush BATCH');
        result = notifyMultiple(message.viewer, message.data, createLoaders());

        break;
      }
      case 'mail': {
        log.info('Starting mail');
        const mailData = message.data;
        result = await root.BackgroundService.handleEmails(
          mailData.mailType,
          mailData,
        );
        break;
      }

      case 'batchMailing': {
        log.info('BATCHMAIL ;DATA', { message });
        result = await root.BackgroundService.handleEmails(
          message.data,
          EmailType.TEST_BATCH,
        );
        break;
      }

      case 'message': {
        result = handleMessages(
          message.data.viewer,
          message.data,
          message.data.receiver,
        );
        break;
      }

      case 'clean': {
        // clean up proposal_voters, etc
        throw Error('TO IMPLEMENT');
        // result = handleCleaning();
      }

      default:
        throw Error(`Job type not recognized: ${message.type}`);
    }
  } catch (e) {
    log.error(e);
  }
  return result;
}
process.on('message', processMessages);
function onClosing(code, signal) {
  log.warn({ signal }, 'Worker closing');
  this.kill();
}
process.on('close', onClosing);
process.on('exit', onClosing);
