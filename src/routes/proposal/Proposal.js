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
import Statement from '../../components/Statement';
import s from './Proposal.css';

class Proposal extends React.Component {

  static propTypes = {
    proposal: PropTypes.shape({
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
        surname: PropTypes.string.isRequired,
      }),
      pollOne: PropTypes.shape({
        statements: PropTypes.arrayOf(PropTypes.shape({
          title: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired,
          author: PropTypes.shape({
            name: PropTypes.string.isRequired,
            surname: PropTypes.string.isRequired,
          }),
          vote: PropTypes.shape({
            position: PropTypes.string.isRequired,
          }),
        }),
      ),
      }),
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div>
            {this.props.proposal.title}
          </div>
          <div>
            {this.props.proposal.body}
          </div>
        </div>
        <div className={s.container}>
          {this.props.proposal.pollOne.statements.map(statement => (
            <Statement title={statement.title} position={statement.vote.position} />
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
