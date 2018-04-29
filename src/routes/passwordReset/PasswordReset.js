import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './PasswordReset.css';
import { resetPassword } from '../../actions/password_reset';
import { getAccountUpdates } from '../../reducers';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Box from '../../components/Box';
import Notification from '../../components/Notification';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
} from '../../core/validation';

const messages = defineMessages({
  password: {
    id: 'signup.password',
    defaultMessage: 'Create a password',
    description: 'Password',
  },
  passwordAgain: {
    id: 'signup.passwordAgain',
    defaultMessage: 'Confirm your password',
    description: 'PasswordAgain',
  },
  reset: {
    id: 'passwordRecovery.reset',
    defaultMessage: 'Reset Password',
    description: 'Reset Password',
  },
  empty: {
    id: 'form.error-empty',
    description: 'Help for empty fields',
    defaultMessage: "You can't leave this empty",
  },
  shortPassword: {
    id: 'signup.error-shortPassword',
    defaultMessage:
      'Short passwords are easy to guess. Try one with at least 6 characters ',
    description: 'Help for short passwords',
  },
  passwordMismatch: {
    id: 'signup.error-passwordMismatch',
    defaultMessage: "These passwords don't match. Try again?",
    description: 'Help for mismatching passwords',
  },
});

const formFields = ['password', 'passwordAgain'];
class PasswordReset extends React.Component {
  static propTypes = {
    resetPassword: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    updates: PropTypes.shape({ password: PropTypes.string }),
  };

  static defaultProps = {
    updates: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      password: '',
      passwordAgain: '',
      errors: {
        password: {
          touched: false,
        },
        passwordAgain: {
          touched: false,
        },
      },
    };
    const testValues = {
      password: { fn: 'password' },
      passwordAgain: { fn: 'passwordAgain' },
    };
    this.Validator = createValidator(
      testValues,
      {
        password: passwordValidation,
        passwordAgain: passwordAgainValidation,
      },
      this,
      obj => obj.state,
      {
        minPasswordLength: 6,
      },
    );

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps({ updates }) {
    if (updates && updates.password && updates.password.error) {
      this.setState({
        password: '',
        passwordAgain: '',
        error: !this.props.updates.password.error,
      });
    }
  }
  onSubmit() {
    if (this.handleValidation(formFields)) {
      let { password } = this.state;

      password = password.trim();
      const data = {
        password,
        token: this.props.token,
      };
      //  alert(JSON.stringify(data));
      this.props.resetPassword(data);
    }
  }
  handleValueChange(e) {
    const field = e.target.name;
    const { value } = e.target;
    if (this.state.errors[field].touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          [field]: { ...this.state.errors[field], touched: false },
        },
      });
    }
    this.setState({ [field]: value });
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }

  handleBlur(e) {
    const fields = [];
    const currentField = e.target.name;
    fields.push(e.target.name);
    if (currentField) {
      if (currentField === 'password' && this.state.passwordAgain.length > 0) {
        fields.push('passwordAgain');
      }
      this.handleValidation(fields);
    }
  }
  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
      }
      return acc;
    }, {});
  }

  render() {
    let content;
    const { updates } = this.props;
    if (updates && updates.password && updates.password.success) {
      content = <div> YOU ARE LOGGED IN!</div>;
    } else {
      const { passwordError, passwordAgainError } = this.visibleErrors(
        formFields,
      );
      content = (
        <Box column pad>
          <h1> Reset Password</h1>
          <div>
            <FormField
              label={<FormattedMessage {...messages.password} />}
              error={passwordError}
            >
              <input
                id="password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleValueChange}
                onBlur={this.handleBlur}
              />
            </FormField>

            <FormField
              label={<FormattedMessage {...messages.passwordAgain} />}
              error={passwordAgainError}
            >
              <input
                id="passwordAgain"
                type="password"
                name="passwordAgain"
                value={this.state.passwordAgain}
                onChange={this.handleValueChange}
                onBlur={this.handleBlur}
              />
            </FormField>
          </div>

          <Button
            primary
            label={<FormattedMessage {...messages.reset} />}
            onClick={this.onSubmit}
          />
        </Box>
      );
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.state.error && (
            <Notification type="error" message={updates.password.error} />
          )}
          {content}
        </div>
      </div>
    );
  }
}

const mapDispatch = {
  resetPassword,
};
const mapStateToProps = state => ({
  updates: getAccountUpdates(state, 'pw'),
});

export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(PasswordReset),
);
