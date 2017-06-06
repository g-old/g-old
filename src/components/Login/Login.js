import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { login } from '../../actions/session';
import { getAccountUpdates } from '../../reducers';
import Link from '../Link';
import Button from '../Button';
import Box from '../Box';
import FormField from '../FormField';
import history from '../../history';
import { createValidator, passwordValidation, emailValidation } from '../../core/validation';

const messages = defineMessages({
  email: {
    id: 'login.email',
    defaultMessage: 'Email',
    description: 'Email-address',
  },
  password: {
    id: 'login.password',
    defaultMessage: 'Password',
    description: 'Password',
  },
  resetPassword: {
    id: 'login.resetPassword',
    defaultMessage: 'Forgot your password?',
    description: 'Help for password',
  },
  empty: {
    id: 'signup.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  invalidEmail: {
    id: 'signup.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  error: {
    id: 'login.error',
    defaultMessage: 'Login attempt failed',
    description: 'Failed login',
  },
});

class Login extends React.Component {
  static propTypes = {
    status: PropTypes.shape({
      login: PropTypes.shape({
        error: PropTypes.bool,
        success: PropTypes.bool,
        pending: PropTypes.bool,
      }),
    }).isRequired,
    login: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.state = { email: '', password: '', errors: { email: {}, password: {} } };

    const testValues = {
      password: { fn: 'password' },
      email: { fn: 'email' },
    };
    this.Validator = createValidator(
      testValues,
      {
        password: passwordValidation,
        email: emailValidation,
      },
      this,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.status && nextProps.status.login.error) {
      this.setState({ password: '' });
    }
  }
  onEmailChange(e) {
    this.setState({ email: e.target.value });
  }
  onPasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleLogin() {
    const validated = this.Validator(['password', 'email']);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    if (!validated.failed) {
      this.props.login({ email: this.state.email.trim(), password: this.state.password.trim() });
    }
  }
  render() {
    const { status } = this.props;
    if (status.login && status.login.success) {
      history.push('/feed');
    }
    const emailError = this.state.errors.email.errorName
      ? <FormattedMessage {...messages[this.state.errors.email.errorName]} />
      : null;

    const passwordError = this.state.errors.password.errorName
      ? <FormattedMessage {...messages[this.state.errors.password.errorName]} />
      : null;

    const loginError = status.login && status.login.error
      ? (<div style={{ backgroundColor: 'rgba(255, 50, 77,0.3)' }}>
        <FormattedMessage {...messages.error} />
      </div>)
      : null;
    return (
      <Box column pad>
        <fieldset>
          <FormField label={<FormattedMessage {...messages.email} />} error={emailError}>
            <input
              name="email"
              type="text"
              value={this.state.email}
              onChange={this.onEmailChange}
            />
          </FormField>
          <FormField label={<FormattedMessage {...messages.password} />} error={passwordError}>
            <input
              name="password"
              type="password"
              value={this.state.password}
              onChange={this.onPasswordChange}
            />
          </FormField>
          {loginError}
        </fieldset>
        <Button
          fill
          primary
          label="Log In"
          onClick={this.handleLogin}
          disabled={status.login && status.login.pending}
        />
        <Link to={'/account/password/reset'}>
          <FormattedMessage {...messages.resetPassword} />
        </Link>
      </Box>
    );
  }
}

const mapStateToProps = (state) => {
  const initialId = '0000';
  return {
    status: getAccountUpdates(state, initialId),
  };
};
const mapDispatch = {
  login,
};
export default connect(mapStateToProps, mapDispatch)(Login);
