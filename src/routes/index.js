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
      path: '/surveys',
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
      children: [
        {
          path: '',
          load: () => import(/* webpackChunkName: 'admin' */ './admin'),
        },
        {
          path: '/platform',
          children: [
            {
              path: '',
              load: () => import(/* webpackChunkName: 'admin' */ './platform'),
            },
            {
              path: '/settings',
              load: () =>
                import(/* webpackChunkName: 'admin' */ './platformSettings'),
            },
          ],
        },
        {
          path: '/users',
          children: [
            {
              path: '',
              load: () => import(/* webpackChunkName: 'admin' */ './users'),
            },
          ],
        },
        {
          path: '/group',
          children: [
            {
              path: '/:id/',
              load: () => import(/* webpackChunkName: 'admin' */ './groupShow'),
            },
          ],
        },
        {
          path: '/groups',
          children: [
            {
              path: '',
              load: () => import(/* webpackChunkName: 'admin' */ './groups'),
            },
            {
              path: '/add',
              load: () =>
                import(/* webpackChunkName: 'admin' */ './groupsEdit'),
            },
          ],
        },
      ],
    },
    {
      path: '/group/:id',
      children: [
        {
          path: '',
          load: () => import(/* webpackChunkName: 'admin' */ './groupShow'),
        },
        {
          path: '/members',
          load: () => import(/* webpackChunkName: 'admin' */ './groupShow'),
        },
        {
          path: '/proposals',
          load: () => import(/* webpackChunkName: 'admin' */ './groupShow'),
        },
        {
          path: '/groups',
          load: () => import(/* webpackChunkName: 'admin' */ './groupShow'),
        },
        {
          path: '/admin',
          children: [
            {
              path: '',
              load: () =>
                import(/* webpackChunkName: 'admin' */ './groupAdmin'),
            },
            {
              path: '/proposals',
              load: () =>
                import(/* webpackChunkName: 'admin' */ './proposalsManager'),
            },
            {
              path: '/groups',
              children: [
                {
                  path: '',
                  load: () =>
                    import(/* webpackChunkName: 'admin' */ './ggroups'),
                },
                {
                  path: '/add',
                  load: () =>
                    import(/* webpackChunkName: 'admin' */ './ggroupsEdit'),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '/useraccount/:id/',
      children: [
        {
          path: '',
          load: () => import(/* webpackChunkName: 'admin' */ './userShow'),
        },
        {
          path: '/settings/',
          children: [
            {
              path: '',
              load: () =>
                import(/* webpackChunkName: 'admin' */ './settingsShow'),
            },
          ],
        },
      ],
    },
    {
      path: '/admin/workteam/create',
      load: () => import(/* webpackChunkName: 'admin' */ './groupCreate'),
    },
    {
      path: '/workteams',
      load: () => import(/* webpackChunkName: 'workteam' */ './groupList'),
    },
    {
      path: '/workteams/:id',
      load: () => import(/* webpackChunkName: 'workteam' */ './group'),
    },
    {
      path: '/workteams/:id/discussions/:id',
      load: () => import(/* webpackChunkName: 'workteam' */ './discussion'),
    },
    {
      path: '/workteams/:id/admin',
      load: () => import(/* webpackChunkName: 'admin' */ './groupManager'),
    },
    {
      path: '/workteams/:id/edit',
      load: () => import(/* webpackChunkName: 'admin' */ './groupEdit'),
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
        import(/* webpackChunkName: 'emailVerification' */ './emailVerification'),
    },

    // Wildcard routes, e.g. { path: '*', ... } (must go last)
    {
      path: '*',
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
