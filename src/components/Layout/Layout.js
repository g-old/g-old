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
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {ButtonTest} from 'componentslib_test';
import normalizeCss from 'normalize.css';
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
  static propTypes = {
    children: PropTypes.node.isRequired,
    createSSESub: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    allowCookies: PropTypes.func.isRequired,
    consent: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.consent = this.consent.bind(this);
  }

  consent() {
    this.props.allowCookies();
  }

  render() {
    const { consent } = this.props;
    let toast;
    if (!consent) {
      toast = (
        <Toast alert onClose={this.consent}>
          <FormattedMessage {...messages.cookieBanner} />
        </Toast>
      );
    }

    const banner = (
      <div className={s.banner}>
        <img alt="banner" src="/banner01.jpg" />
      </div>
    );
    return <div className={s.layout}>
        <div className={this.props.loading ? s.loader : null} />
        {toast}
        {banner}
        <Header />
        <div className={s.content}>
          <ButtonTest label={'TESTLABEL'} /> {this.props.children}
        </div>
        <div className={s.footer}>
          <Footer />
        </div>
      </div>;
  }
}

const mapDispatch = {
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
