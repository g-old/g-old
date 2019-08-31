/* eslint-disable react/destructuring-assignment */
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
import {
  createValidator,
  passwordValidation,
  emailValidation,
} from '../../core/validation';

const messages = defineMessages({
  email: {
    id: 'label.email',
    defaultMessage: 'Email',
    description: 'Heading of email section',
  },
  password: {
    id: 'label.password',
    defaultMessage: 'Password',
    description: 'Heading of password section',
  },
  resetPassword: {
    id: 'login.resetPassword',
    defaultMessage: 'Forgot your password?',
    description: 'Help for password',
  },
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  invalidEmail: {
    id: 'form.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  error: {
    id: 'login.error',
    defaultMessage: 'Login attempt failed',
    description: 'Failed login',
  },
  login: {
    id: 'label.login',
    defaultMessage: 'Log In',
    description: 'Label login',
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
    this.onSubmit = this.onSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.state = {
      email: '',
      password: '',
      errors: { email: {}, password: {} },
    };

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
      obj => obj.state,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.status &&
      nextProps.status.login &&
      nextProps.status.login.error
    ) {
      this.setState({ password: '' });
    }
  }

  onEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  onPasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  onSubmit(e) {
    /* prevent the default form-submit action */
    e.preventDefault();
    this.handleLogin();

    /* apparently this is needed with some browsers to prevent the submit action */
    return false;
  }

  handleLogin() {
    const validated = this.Validator(['password', 'email']);
    this.setState(prevState => ({
      errors: { ...prevState.errors, ...validated.errors },
    }));
    if (!validated.failed) {
      this.props.login({
        email: this.state.email.trim(),
        password: this.state.password.trim(),
      });
    }
  }

  render() {
    const { status } = this.props;
    const { errors, password, email } = this.state;
    /*  if (status.login && status.login.success) {
      // /  history.push('/private');
    } */
    const emailError = errors.email.errorName ? (
      <FormattedMessage {...messages[errors.email.errorName]} />
    ) : null;

    const passwordError = errors.password.errorName ? (
      <FormattedMessage {...messages[errors.password.errorName]} />
    ) : null;

    const loginError =
      status.login && status.login.error ? (
        <div style={{ backgroundColor: 'rgba(255, 50, 77,0.3)' }}>
          <FormattedMessage {...messages.error} />
        </div>
      ) : null;
    return (
      <Box column pad>
        <form onSubmit={this.onSubmit}>
          {/* invisible submit button */}
          <input type="submit" style={{ display: 'none' }} />
          <fieldset>
            <FormField
              label={<FormattedMessage {...messages.email} />}
              error={emailError}
            >
              <input
                name="email"
                type="text"
                value={email}
                onChange={this.onEmailChange}
              />
            </FormField>
            <FormField
              label={<FormattedMessage {...messages.password} />}
              error={passwordError}
            >
              <input
                name="password"
                type="password"
                value={password}
                onChange={this.onPasswordChange}
              />
            </FormField>
            {loginError}
          </fieldset>
        </form>
        <Button
          fill
          primary
          label={<FormattedMessage {...messages.login} />}
          onClick={this.handleLogin}
          disabled={status.login && status.login.pending}
        />
        {/* eslint-disable */}
        <Link to="/account/password/reset">
          {/* eslint-enable */}

          <FormattedMessage {...messages.resetPassword} />
        </Link>
      </Box>
    );
  }
}

const mapStateToProps = state => {
  const initialId = '0000';
  return {
    status: getAccountUpdates(state, initialId),
  };
};
const mapDispatch = {
  login,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(Login);
