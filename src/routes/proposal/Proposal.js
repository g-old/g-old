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
import s from './Proposal.css';

class Proposal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { proposalId: -1 };
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.state.proposalId}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
