/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Admin.css';
import Tab from '../../components/Tab';
import Tabs from '../../components/Tabs';
import UserPanel from '../../components/UserPanel';
import ProposalPanel from '../../components/ProposalPanel';
import SupervisionPanel from '../../components/SupervisionPanel';
import TechPanel from '../../components/TechPanel';
import WorkTeamPanel from '../../components/WorkTeamPanel';
import ActivityPanel from '../../components/ActivityPanel';

class Admin extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div className={s.container}>
        <Tabs>
          <Tab title="USERMANAGEMENT">
            <UserPanel />
          </Tab>
          <Tab title="PROPOSALS">
            <ProposalPanel />
          </Tab>
          <Tab title="TECH">
            <TechPanel />
          </Tab>
          <Tab title="SUPERVISION">
            <SupervisionPanel />
          </Tab>
          <Tab title="WORKTEAMS">
            <WorkTeamPanel />
          </Tab>
          <Tab title="ACTIVITIES">
            <ActivityPanel />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withStyles(s)(Admin);
