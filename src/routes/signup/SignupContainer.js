import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './SignupContainer.css';
import SignUp from '../../components/SignUp';
import { createUser } from '../../actions/user';
import { allowCookies } from '../../actions/session';

// import { uploadAvatar } from '../../actions/file';
import { getAccountUpdates, getLocale, getRecaptchaKey } from '../../reducers';
// import Button from '../../components/Button';
import history from '../../history';
import Box from '../../components/Box/Box';
import Heading from '../../components/Heading/Heading';
// import Headline from '../../components/Headline';
// import Help from '../../components/Help';

const messages = defineMessages({
  title: {
    id: 'signup.title',
    defaultMessage:
      "Create your VIP account. I'ts free and only takes a minute",
    description: 'Heading of signup form',
  },
});

class SignupContainer extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    setCookie: PropTypes.func.isRequired,
    updates: PropTypes.shape({ email: PropTypes.string }).isRequired,
    // locale: PropTypes.string.isRequired,
    user: PropTypes.shape({}),
    recaptchaKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      serverCalled: false,
    };
    this.onCreateUser = this.onCreateUser.bind(this);
  }

  componentWillReceiveProps({ updates, user }) {
    if (updates) {
      const success =
        Object.keys(updates).find(key => !updates[key].success) == null;
      const updateError = Object.keys(updates).some(key => updates[key].error);
      const updatePending = Object.keys(updates).some(
        key => updates[key].pending === true,
      );
      const { error, pending, step, serverCalled } = this.state;
      if (updateError !== error) {
        this.setState({ error: updateError });
      }
      if (updatePending !== pending) {
        this.setState({ pending: updatePending });
      }
      if (success && serverCalled) {
        history.push(`/account`);
        this.setState({ step: 1 });
      }
      if (step === 0 && user) {
        this.setState({ step: 1 });
      }
    }
  }

  onCreateUser(data, captchaResponse) {
    // dispatch

    // eslint-disable-next-line react/destructuring-assignment
    this.props.createUser(data, captchaResponse);
    this.setState({ serverCalled: true });
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    const { updates, recaptchaKey, setCookie } = this.props;
    const { error, hasError, pending, step } = this.state;

    if (hasError || !recaptchaKey) {
      return <h1>Please reload the browser</h1>;
    }
    let emailError = false;
    if (updates.email && updates.email.error) {
      emailError = updates.email.error.unique === false;
    }
    switch (step) {
      case 0:
        return (
          <Box className={s.root} column align>
            <Heading tag="h3">
              <FormattedMessage {...messages.title} />
            </Heading>
            <SignUp
              pending={pending}
              notUniqueEmail={emailError}
              allowCookies={setCookie}
              error={error}
              onCreateUser={this.onCreateUser}
              recaptchaKey={recaptchaKey}
            />
          </Box>
        );
      case 1:
        return 'Loading, please wait';
      /* <div>
            <Headline medium>
              <FormattedMessage {...messages.welcome} />
            </Headline>
            <Help locale={this.props.locale} firstSteps />
            <Button
              primary
              onClick={() => history.push(`/account`)}
              label={<FormattedMessage {...messages.next} />}
            />
          </div> */

      default:
        return <div />;
    }
  }
}
const mapStateToProps = state => ({
  updates: getAccountUpdates(state, '0000'),
  intl: getLocale(state), // fix for forceUpdate
  recaptchaKey: getRecaptchaKey(state),
});
const mapDispatch = {
  createUser,
  setCookie: allowCookies,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(SignupContainer));
