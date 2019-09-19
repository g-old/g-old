/* eslint-disable react/jsx-props-no-spreading */
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
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import normalizeCss from 'normalize.css';
import { createSSESub } from '../../actions/sseSubs';
import { allowCookies } from '../../actions/session';
import { getConsent } from '../../reducers';
import Toast from '../Toast';
// external-global styles must be imported in your JS.
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';

const messages = defineMessages({
  cookieBanner: {
    id: 'cookieBanner',
    defaultMessage: 'By using this site you accept our privacy policy.',
    description: 'Cookie banner, should comply to EU regulations',
  },
});

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.consent = this.consent.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.createSSESub();
  }

  consent() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.allowCookies();
  }

  render() {
    const { consent, children, loading } = this.props;
    let toast;
    if (!consent) {
      toast = (
        <Toast alert onClose={this.consent}>
          <FormattedMessage {...messages.cookieBanner} />
        </Toast>
      );
    }

    return (
      <div className={s.layout}>
        <div className={loading ? s.loader : null} />
        {toast}
        <Header />
        <div className={s.content}>{children}</div>
        <div className={s.footer}>
          <Footer />
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  createSSESub: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  allowCookies: PropTypes.func.isRequired,
  consent: PropTypes.string.isRequired,
};

const mapDispatch = {
  createSSESub,
  allowCookies,
};
const mapStateToProps = state => ({
  loading: state.ui.loading.status,
  consent: getConsent(state),
});
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(normalizeCss, s)(Layout));
