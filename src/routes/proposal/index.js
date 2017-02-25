/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

 import React from 'react';
 import Layout from '../../components/Layout';
 import Proposal from './Proposal';
 import fetch from '../../core/fetch';

 const title = 'Proposal';

 export default {

   path: '/proposal',

   async action({ store }) {
     if (!store.getState().user) {
       return { redirect: '/' };
     }
     const resp = await fetch('/graphql', {
       method: 'post',
       headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         query: '{proposalDL(id: 3){title,body,author{name,surname},pollOne{statements{title,author{name,surname},text,vote{position}}}}}',
       }),
       credentials: 'same-origin', //'same-origin', //'include', is for CORS
     });
     const { data } = await resp.json();

     if (!data || !data.proposalDL) throw new Error('Failed to load the proposal.');

     return {
       title: 'Proposals',
       component: <Layout><Proposal title={title} proposal={data.proposalDL} /> </Layout>,
     };
   },

 };
