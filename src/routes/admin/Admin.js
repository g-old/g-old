/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Admin.css';
import Tab from '../../components/Tab';
import Tabs from '../../components/Tabs';
import UserPanel from '../../components/UserPanel';
import ProposalPanel from '../../components/ProposalPanel';
import SupervisionPanel from '../../components/SupervisionPanel';
import TechPanel from '../../components/TechPanel';

class Admin extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Tabs>
            <Tab title="USERMANAGEMENT">
              <UserPanel />
            </Tab>
            <Tab title="PROPOSALPANEL">
              <ProposalPanel />
            </Tab>
            <Tab title="TECHPANEL">
              <TechPanel />
            </Tab>
            <Tab title="SUPERVISIONPANEL">
              <SupervisionPanel />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Admin);
