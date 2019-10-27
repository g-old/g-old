/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable global-require */

// The top-level (parent) route
const routes = {
  path: '/',

  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '/',
      load: () => import(/* webpackChunkName: 'home' */ './home'),
    },
    {
      path: '/notifications',
      load: () =>
        import(/* webpackChunkName: 'notifications' */ './notifications'),
    },

    {
      path: '/feed',
      load: () => import(/* webpackChunkName: 'feed' */ './feed'),
    },
    {
      path: '/proposal/:id/:pollId',
      load: () => import(/* webpackChunkName: 'proposal' */ './proposal'),
    },
    {
      path: '/proposals/:state',
      load: () => import(/* webpackChunkName: 'proposals' */ './proposals'),
    },
    {
      path: '/proposals/tagged/:tagId',
      load: () => import(/* webpackChunkName: 'proposals' */ './tagged'),
    },
    {
      path: '/about',
      load: () => import(/* webpackChunkName: 'about' */ './about'),
    },
    {
      path: '/surveys/:filter',
      load: () => import(/* webpackChunkName: 'surveys' */ './surveys'),
    },
    {
      path: '/account',
      load: () => import(/* webpackChunkName: 'account' */ './account'),
    },
    {
      path: '/accounts',
      load: () => import(/* webpackChunkName: 'account' */ './accountList'),
    },
    {
      path: '/accounts/:id',
      load: () => import(/* webpackChunkName: 'account' */ './accounts'),
    },
    {
      path: '/admin',
      load: () => import(/* webpackChunkName: 'admin' */ './admin'),
    },
    {
      path: '/message/:id',
      load: () => import(/* webpackChunkName: 'message' */ './message'),
    },
    {
      path: '/admin/workteam/create',
      load: () => import(/* webpackChunkName: 'admin' */ './workTeamCreate'),
    },
    {
      path: '/workteams',
      load: () => import(/* webpackChunkName: 'workteam' */ './workTeamList'),
    },
    {
      path: '/workteams/:id',
      load: () => import(/* webpackChunkName: 'workteam' */ './workTeam'),
    },
    {
      path: '/workteams/:id/discussions/:id',
      load: () => import(/* webpackChunkName: 'workteam' */ './discussion'),
    },
    {
      path: '/workteams/:id/members',
      load: () => import(/* webpackChunkName: 'workteam' */ './memberList'),
    },
    {
      path: '/workteams/:id/admin',
      load: () => import(/* webpackChunkName: 'admin' */ './workTeamManager'),
    },
    {
      path: '/workteams/:id/edit',
      load: () => import(/* webpackChunkName: 'admin' */ './workTeamEdit'),
    },
    {
      path: '/signup',
      load: () => import(/* webpackChunkName: 'signup' */ './signup'),
    },
    {
      path: '/logged-out',
      load: () => import(/* webpackChunkName: 'loggedOut' */ './loggedOut'),
    },
    {
      path: '/account/password/reset',
      load: () =>
        import(/* webpackChunkName: 'passwordRecovery' */ './passwordRecovery'),
    },
    {
      path: '/reset/:token',
      load: () =>
        import(/* webpackChunkName: 'passwordReset' */ './passwordReset'),
    },
    {
      path: '/verify',
      load: () =>
        import(
          /* webpackChunkName: 'emailVerification' */ './emailVerification'
        ),
    },

    // Wildcard routes, e.g. { path: '*', ... } (must go last)
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
    },
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();

    // Provide default values for title, description etc.
    route.title = `${route.title || 'Untitled Page'} - g-old.org`;
    route.description = route.description || '';

    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
  routes.children.unshift({
    path: '/error',
    action: require('./error').default,
  });
}

export default routes;
