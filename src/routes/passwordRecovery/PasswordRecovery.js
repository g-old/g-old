import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './PasswordRecovery.css';
import { recoverPassword } from '../../actions/password_reset';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Box from '../../components/Box';
import { createValidator, emailValidation } from '../../core/validation';

const messages = defineMessages({
  email: {
    id: 'login.email',
    defaultMessage: 'Email',
    description: 'Email-address',
  },
  reset: {
    id: 'passwordRecovery.reset',
    defaultMessage: 'Reset Password',
    description: 'Reset Password',
  },
  stepOne: {
    id: 'passwordRecovery.stepOne',
    defaultMessage:
      "Enter your email address below and we'll send you a link to reset your password",
    description: 'Password recovery instruction',
  },
  stepTwo: {
    id: 'passwordRecovery.stepTwo',
    defaultMessage:
      "Check your inbox for the next steps. If you don't receive an email, and it's not in your spam folder this could mean you signed up with a different address.",
    description: 'Password recovery instruction',
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
});

class PasswordRecovery extends React.Component {
  static propTypes = {
    recoverPassword: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      errors: {
        email: {
          touched: false,
        },
      },
    };
    const testValues = {
      email: { fn: 'email' },
    };
    this.Validator = createValidator(
      testValues,
      {
        email: emailValidation,
      },
      this,
      obj => obj.state,
    );
    this.onEmailChange = this.onEmailChange.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  onEmailChange(e) {
    const email = e.target.value;
    this.setState({ email });
  }
  onSubmit() {
    if (this.handleValidation(['email'])) {
      let { email } = this.state;

      email = email.trim().toLowerCase();
      const data = {
        email,
      };
      //  alert(JSON.stringify(data));
      this.props.recoverPassword(data);
      this.setState({ sent: true });
    }
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
      this.handleValidation(fields);
    }
  }
  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = <FormattedMessage {...messages[this.state.errors[curr].errorName]} />;
      }
      return acc;
    }, {});
  }

  render() {
    let help = null;
    if (this.state.sent) {
      help = <div><FormattedMessage {...messages.stepTwo} /></div>;
    } else {
      const { emailError } = this.visibleErrors(['email']);
      help = (
        <Box column pad>
          <FormattedMessage {...messages.stepOne} />
          <FormField label={<FormattedMessage {...messages.email} />} error={emailError}>
            <input
              value={this.state.email}
              onChange={this.onEmailChange}
              id="email"
              onBlur={this.handleBlur}
              type="text"
              name="email"
            />
          </FormField>
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
          <h1> Reset Password</h1>
          {help}
        </div>
      </div>
    );
  }
}

const mapDispatch = {
  recoverPassword,
};

export default connect(null, mapDispatch)(withStyles(s)(PasswordRecovery));
