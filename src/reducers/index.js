import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import intl, * as fromIntl from './intl';
import entities, * as fromEntity from './entities';
import ui, * as fromUi from './ui';
import consent from './consent';
import system from './system';
import pageInfo, * as fromPageInfo from './pageInfo';

export default combineReducers({
  user,
  runtime,
  intl,
  entities,
  ui,
  consent,
  system,
  pageInfo,
});

/* GENERATOR */

export const getResourcePageInfo = (state, resource, filter) =>
  fromPageInfo.getPageInfo(state.pageInfo, resource, filter);

export const getSessionUser = state =>
  fromEntity.getUser(state.entities, state.user);

export const getAccountUpdates = (state, id) =>
  fromUi.getAccountUpdates(state.ui, id);

export const getUser = (state, id) => fromEntity.getUser(state.entities, id);

export const getConsent = state => state.consent;
export const getLocale = state => fromIntl.getLocale(state);
export const getRecaptchaKey = state => state.system.recaptchaKey;
export const getWebPushKey = state => state.system.webPushKey;
export const getDroneBranch = state => state.system.droneBranch;
export const getDroneBuild = state => state.system.droneBuild;
