import { GraphQLInt, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';

import PageType from '../types/PageType';
import MessageType from '../types/MessageType';
import Message from '../models/Message';
import MessageTypeEnum from '../types/MessageTypeEnum';
import knex from '../knex';
import CategoryTypeEnum from '../types/CategoryTypeEnum';

const messageObjects = {
  type: PageType(MessageType),
  args: {
    first: {
      type: GraphQLInt,
    },
    isPublished: {
      type: GraphQLBoolean,
    },
    messageType: {
      type: MessageTypeEnum,
    },
    category: {
      type: CategoryTypeEnum,
    },

    after: {
      type: GraphQLString,
    },
    userId: {
      type: GraphQLID,
    },
  },
  resolve: async (
    parent,
    {
      first = 10,
      after = '',
      userId,
      isPublished = true,
      messageType,
      category,
    },
    { viewer, loaders },
  ) => {
    const pagination = Buffer.from(after, 'base64').toString('ascii');
    let [cursor = new Date(), id = 0] = pagination ? pagination.split('$') : []; //eslint-disable-line
    id = Number(id);

    const table = messageType ? `${messageType}s` : 'messages';
    const objectIds = await knex(table)
      .modify(queryBuilder => {
        if (messageType === 'note') {
          queryBuilder.where({
            is_published: isPublished,
            ...(category && { category }),
          });
        } else {
          queryBuilder.where({
            sender_id: userId || viewer.id,
          });
        }
      })
      .whereRaw(`(${table}.created_at, ${table}.id) < (?,?)`, [cursor, id])
      .limit(first)
      .orderBy(`${table}.created_at`, 'desc')
      .orderBy(`${table}.id`, 'desc')
      .select(`${table}.id as id`, `${table}.created_at as time`);

    let queries;
    if (messageType) {
      queries = objectIds.map(oId =>
        Promise.resolve(
          new Message({
            id: `mo${oId.id}`,
            message_type: messageType,
            message_object_id: oId.id,
          }),
        ),
      );
    } else {
      queries = objectIds.map(p => Message.gen(viewer, p.id, loaders));
    }

    const messagesSet = objectIds.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    const data = await Promise.all(queries);
    const edges = data.map(p => ({ node: p }));
    let endCursor;
    if (edges.length > 0) {
      const lastNode = edges[edges.length - 1].node;
      const objId = lastNode.id.slice(2);
      Buffer.from(
        `${new Date(messagesSet[objId].time).toJSON()}$${objId}`,
      ).toString('base64');
    } else {
      endCursor = null;
    }

    const hasNextPage = edges.length === first;
    return {
      edges,
      pageInfo: {
        startCursor: null,
        endCursor,
        hasNextPage,
      },
    };
  },
};

export default messageObjects;
