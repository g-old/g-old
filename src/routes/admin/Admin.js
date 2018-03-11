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
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './Admin.css';
import Box from '../../components/Box';

import Image from '../../components/Image';
import Label from '../../components/Label';
import Anchor from '../../components/Anchor';

class Admin extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired };

  render() {
    const { children } = this.props;
    const navHeader = (
      <Box className={s.navHeader} between fill>
        <span>
          <Anchor to="/admin" className={s.title}>
            {'Plattformtitle'}
          </Anchor>
          <div>
            <span>Owner: </span>
          </div>
        </span>
        <Image className={s.picture} src="/tile.png" />
      </Box>
    );

    const pageNav = (
      <Box className={s.pageNav} pad>
        <Anchor to="/admin/users">USERS</Anchor>
        <Anchor to="/admin/plattform">PLATTFORM</Anchor>
        <Label>GROUPS</Label>
        <Label>PROPOSALS</Label>
        <Label>SURVEYS</Label>
        <Label>TECHDATA</Label>
      </Box>
    );
    return (
      <div className={s.container}>
        {navHeader}
        {pageNav}
        {children}
      </div>
    );
  }
}

export default withStyles(s)(Admin);
