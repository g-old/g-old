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
import Statement from '../../components/Statement';
import s from './Proposal.css';

class Proposal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          This is an awesome (and rather static) proposal.
        </div>
        <div className={s.container}>
          <Statement title="yes." position="true" />
          <Statement title="noo.." position="false" />
          <Statement title="YES!" position="true" />
          <Statement title="mavalá!" position="false" />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
