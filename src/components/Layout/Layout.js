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
import { connect } from 'react-redux';
import normalizeCss from 'normalize.css';
import { createSSESub } from '../../actions/sseSubs';

// external-global styles must be imported in your JS.
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    createSSESub: PropTypes.func.isRequired,
  };
  componentDidMount() {
    this.props.createSSESub();
  }
  render() {
    return (
      <div>
        <Header />
        <div className={s.content}>
          {this.props.children}
        </div>
        <Footer />
      </div>
    );
  }
}

const mapDispatch = {
  createSSESub,
};
export default connect(null, mapDispatch)(withStyles(normalizeCss, s)(Layout));
