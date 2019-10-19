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
import { setSizeVariable } from '../../actions/responsive';
import { getConsent, getLayoutSize, getSessionUser } from '../../reducers';
import { CookieLink } from '../SignUp';
import Toast from '../Toast';
import Responsive from '../../core/Responsive';
import Button from '../Button';
import Box from '../Box';

// external-global styles must be imported in your JS.
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';

const messages = defineMessages({
  cookieBanner: {
    id: 'cookieBanner',
    defaultMessage:
      'This site uses cookies to ensure you get the best browsing experience. More information: {link}',
    description: 'Cookie banner, should comply to EU regulations',
  },
  consent: {
    id: 'command.consent',
    defaultMessage: 'Accept',
    description: 'Commant to allow an action',
  },
});

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.consent = this.consent.bind(this);
    this.onResponsive = this.onResponsive.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.createSSESub();
    this.responsive = Responsive.start(this.onResponsive);
  }

  componentWillUnmount() {
    if (this.responsive) {
      this.responsive.stop();
    }
  }

  onResponsive(small) {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.setSizeVariable({ value: !!small });
  }

  consent() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.allowCookies();
  }

  render() {
    const { consent, children, loading, small, user } = this.props;
    let toast;
    if (!consent) {
      toast = (
        <Toast stay bottom>
          <Box align between>
            <FormattedMessage
              {...messages.cookieBanner}
              values={{ link: <CookieLink /> }}
            />
            <Button primary onClick={this.consent}>
              <FormattedMessage {...messages.consent} />
            </Button>
          </Box>
        </Toast>
      );
    }

    return (
      <div className={s.layout}>
        <div className={loading ? s.loader : null} />
        <Header small={small} user={user} />
        <div className={s.content}>{children}</div>
        <div className={s.footer}>
          {toast}
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
  small: PropTypes.bool.isRequired,
  setSizeVariable: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
};

Layout.defaultProps = {
  user: null,
};

const mapDispatch = {
  createSSESub,
  allowCookies,
  setSizeVariable,
};
const mapStateToProps = state => ({
  loading: state.ui.loading.status,
  consent: getConsent(state),
  small: getLayoutSize(state),
  user: getSessionUser(state),
});
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(normalizeCss, s)(Layout));
