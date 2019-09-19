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
import withStyles from 'isomorphic-style-loader/withStyles';
import { connect } from 'react-redux';

import LanguageSwitcher from '../LanguageSwitcher';
import { getDroneBranch, getDroneBuild } from '../../reducers';
import s from './Footer.css';

class Footer extends React.Component {
  render() {
    const { build, branch } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <span className={s.text}> © V I P </span>
          {branch && (
            <span className={s.buildinfo}>
              <img src="/git.png" alt="#" style={{ height: '1em' }} />
              <span> {branch}</span>
            </span>
          )}
          {build && (
            <span className={s.buildinfo}>
              <svg
                style={{ height: '0.9em', fill: 'white' }}
                viewBox="0 0 256 218"
                preserveAspectRatio="xMidYMid"
              >
                <g>
                  <path
                    d="M128.224307,0.72249586 C32.0994301,0.72249586 0.394430682,
                  84.5663333 0.394430682,115.221578 L78.3225537,115.221578 C78.3225537,
                  115.221578 89.3644231,75.2760497 128.224307,75.2760497 C167.08419,
                  75.2760497 178.130047,115.221578 178.130047,115.221578 L255.605569,
                  115.221578 C255.605569,84.5623457 224.348186,0.72249586 128.224307,
                  0.72249586"
                  />
                  <path
                    d="M227.043854,135.175898 L178.130047,135.175898 C178.130047,
                  135.175898 169.579477,175.122423 128.224307,175.122423 C86.8691361,
                  175.122423 78.3225537,135.175898 78.3225537,135.175898 L30.2571247,
                  135.175898 C30.2571247,145.426215 67.9845088,217.884246 128.699837,
                  217.884246 C189.414168,217.884246 227.043854,158.280482 227.043854,
                  135.175898"
                  />
                  <circle cx="128" cy="126.076531" r="32.7678394" />
                </g>
              </svg>
              <span> {build}</span>
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    );
  }
}

Footer.propTypes = {
  build: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  build: getDroneBuild(state),
  branch: getDroneBranch(state),
});

export default connect(mapStateToProps)(withStyles(s)(Footer));
