/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Box from '../../components/Box';

import Label from '../../components/Label';
import Anchor from '../../components/Anchor';

class Admin extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired };

  render() {
    const { children } = this.props;
    const navHeader = <Box between fill />;

    const pageNav = (
      <Box pad>
        <Anchor to="/admin/users">USERS</Anchor>
        <Anchor to="/admin/platform">PLATFORM</Anchor>
        <Label>GROUPS</Label>
        <Label>PROPOSALS</Label>
        <Label>SURVEYS</Label>
        <Label>TECHDATA</Label>
      </Box>
    );
    return (
      <div>
        {navHeader}
        {pageNav}
        {children}
      </div>
    );
  }
}

export default Admin;
