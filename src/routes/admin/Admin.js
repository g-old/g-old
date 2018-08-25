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
import PropTypes from 'prop-types';
import s from './Admin.css';
import Tab from '../../components/Tab';
import Tabs from '../../components/Tabs';
import UserPanel from '../../components/UserPanel';
import ProposalPanel from '../../components/ProposalPanel';
import SupervisionPanel from '../../components/SupervisionPanel';
import TechPanel from '../../components/TechPanel';
import WorkTeamPanel from '../../components/WorkTeamPanel';
import MessagePanel from '../../components/MessagePanel';
import ActivityPanel from '../../components/ActivityPanel';
import { Groups, isAdmin, Permissions } from '../../organization';

class Admin extends React.Component {
  static propTypes = {
    user: PropTypes.shape({}).isRequired,
  };

  getAllowedPanels() {
    const { user } = this.props;
    const panels = [];
    /* eslint-disable no-bitwise */
    if (user.groups & Groups.MEMBER_MANAGER) {
      panels.push(
        <Tab title="USERMANAGEMENT">
          <UserPanel />
        </Tab>,
      );
    }
    if (user.groups & Groups.MODERATOR) {
      panels.push(
        <Tab title="SUPERVISION">
          <SupervisionPanel />
        </Tab>,
      );
    }
    if (user.groups & Groups.RELATOR) {
      panels.push(
        <Tab title="PROPOSALS">
          <ProposalPanel />
        </Tab>,
      );
    }
    if (user.permissions & Permissions.NOTIFY_ALL) {
      panels.push(
        <Tab title="MESSAGES">
          <MessagePanel />
        </Tab>,
      );
    }
    if (user.groups & Groups.TEAM_LEADER) {
      panels.push(
        <Tab title="WORKTEAMS">
          <WorkTeamPanel />
        </Tab>,
      );
    }
    if (isAdmin(user)) {
      panels.push(
        <Tab title="TECH">
          <TechPanel />
        </Tab>,
        <Tab title="ACTIVITIES">
          <ActivityPanel />
        </Tab>,
      );
    }
    /* eslint-enable no-bitwise */

    return panels.length ? <Tabs>{panels}</Tabs> : [];
  }

  render() {
    return <div className={s.container}>{this.getAllowedPanels()}</div>;
  }
}

export default withStyles(s)(Admin);
