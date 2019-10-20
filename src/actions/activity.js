/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_ACTIVITIES_START,
  LOAD_ACTIVITIES_SUCCESS,
  LOAD_ACTIVITIES_ERROR,
} from '../constants';

import { activityArray as activitiesSchema } from '../store/schema';
import { getFeedIsFetching } from '../reducers';
import { userFields } from './user';
import { commentFields } from './comment';
import { pollFieldsForList } from './proposal';
import { requestFields } from './request';
import { messageFields } from './message';
import { genActivityPageKey } from '../reducers/pageInfo';
import { workTeamFields } from './workTeam';
import { statementFields } from './statement';
import { voteFields } from './vote';
import { discussionFields } from './discussion';

export const objectFields = `
__typename
... on Request {
  ${requestFields}
}
... on Message {
  ${messageFields}
  recipientType
  recipients{
    ... on User{
      ${userFields}
    }
    ... on WorkTeam{
      ${workTeamFields}
    }
  }
}
... on User {
  ${userFields}
}
... on Discussion {
  ${discussionFields}
}
... on Comment {
  ${commentFields}
}
... on ProposalDL {
  id
  title
  publishedAt
  state
  body
  votes
  workteamId
  deletedAt
  pollOne {
    ${pollFieldsForList}
  }
  pollTwo {
    ${pollFieldsForList}
  }
}
... on StatementDL {
  ${statementFields}
}
... on VoteDL {
  ${voteFields}
}
`;
const activityConnection = `
query($first:Int, $after:String, $filter:ActivityFilter){
  activityConnection(first:$first after:$after, filterBy:$filter){
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
        id
        type
        objectId
        verb
        info
        createdAt
        actor {
          ${userFields}
        }
        object {
         ${objectFields}
        }
      }
    }
  }
}

`;
export function loadActivities({ after, filter }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getFeedIsFetching(state, 'all')) {
      return false;
    }
    const pageKey = genActivityPageKey();
    dispatch({
      type: LOAD_ACTIVITIES_START,
      filter: 'all',
      pageKey,
    });

    try {
      const { data } = await graphqlRequest(activityConnection, {
        after,
        filter,
      });
      const activities = data.activityConnection.edges.map(p => p.node);

      const normalizedData = normalize(activities, activitiesSchema);
      dispatch({
        type: LOAD_ACTIVITIES_SUCCESS,
        payload: normalizedData,
        filter: 'all',
        pageKey,
        purge: !after,
        pagination: data.activityConnection.pageInfo,
      });
    } catch (error) {
      dispatch({
        type: LOAD_ACTIVITIES_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        filter: 'all',
        pageKey,
      });
      return false;
    }

    return true;
  };
}
