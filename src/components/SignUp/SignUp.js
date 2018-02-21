import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Recaptcha from 'react-recaptcha';

import { defineMessages, FormattedMessage } from 'react-intl';
import s from './SignUp.css';
import Button from '../Button';
import FormField from '../FormField';
import Box from '../Box';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
  capitalizeFirstLetter,
} from '../../core/validation';

const SCRIPT_ID = 'gold-recaptcha-script';
const fieldNames = ['name', 'surname', 'email', 'password', 'passwordAgain'];
const messages = defineMessages({
  title: {
    id: 'signup.title',
    defaultMessage: 'Please fill out the form below',
    description: 'Heading of signup form',
  },
  email: {
    id: 'signup.email',
    defaultMessage: 'Your current email address',
    description: 'Email-address',
  },
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
  name: {
    id: 'form.name',
    defaultMessage: 'Name',
    description: 'Name',
  },
  forename: {
    id: 'form.forename',
    defaultMessage: 'First',
    description: 'Forename',
  },
  surname: {
    id: 'form.surname',
    defaultMessage: 'Surname',
    description: 'Surname',
  },
  nextStep: {
    id: 'signup.next',
    defaultMessage: 'Next step',
    description: 'Next',
  },
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  shortPassword: {
    id: 'form.error-shortPassword',
    defaultMessage:
      'Short passwords are easy to guess. Try one with at least 6 characters ',
    description: 'Help for short passwords',
  },
  passwordMismatch: {
    id: 'form.error-passwordMismatch',
    defaultMessage: "These passwords don't match. Try again?",
    description: 'Help for mismatching passwords',
  },
  invalidEmail: {
    id: 'form.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  emailTaken: {
    id: 'form.error-emailTaken',
    defaultMessage: 'Email address already in use',
    description: 'Help for not unique email',
  },
  error: {
    id: 'signup.error',
    defaultMessage: 'Could not create your account',
    description: 'Default signup error message',
  },
});

class SignUp extends React.Component {
  static propTypes = {
    onCreateUser: PropTypes.func.isRequired,
    error: PropTypes.bool,
    pending: PropTypes.bool,
    notUniqueEmail: PropTypes.bool,
    recaptchaKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    pending: false,
    error: false,
    notUniqueEmail: false,
  };
  static renderScript() {
    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      script.id = SCRIPT_ID;
      document.body.appendChild(script);
    }
  }

  static removeScript() {
    const script = document.getElementById(SCRIPT_ID);
    if (script) {
      script.parentNode.removeChild(script);
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordAgain: '',
      name: '',
      surname: '',
      email: '',
      invalidEmails: [],
      captchaPending: true,
      errors: {
        password: {
          touched: false,
        },
        passwordAgain: {
          touched: false,
        },
        name: {
          touched: false,
        },
        email: {
          touched: false,
        },
        surname: {
          touched: false,
        },
      },
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.executeCaptcha = this.executeCaptcha.bind(this);
    const testValues = {
      password: { fn: 'password' },
      passwordAgain: { fn: 'passwordAgain' },
      name: { fn: 'name' },
      surname: { fn: 'name' },
      email: { fn: 'email' },
    };
    this.Validator = createValidator(
      testValues,
      {
        password: passwordValidation,
        passwordAgain: passwordAgainValidation,
        email: emailValidation,
        name: nameValidation,
      },
      this,
      obj => obj.state,
      {
        minPasswordLength: 6,
      },
    );
  }

  componentDidMount() {
    SignUp.renderScript();
    if (this.recaptchaInstance) {
      this.recaptchaInstance.reset();
    }
  }

  componentWillReceiveProps({ notUniqueEmail }) {
    if (notUniqueEmail) {
      this.setState({
        ...this.state,
        invalidEmails: [
          ...this.state.invalidEmails,
          this.state.email.trim().toLowerCase(),
        ],
        errors: {
          ...this.state.errors,
          email: { touched: true, errorName: 'emailTaken' },
        },
      });
    }
  }
  componentWillUnmount() {
    SignUp.removeScript();
  }

  onSubmit() {
    if (this.handleValidation(fieldNames)) {
      let { name, surname, email, password } = this.state;
      name = name.trim();
      name = capitalizeFirstLetter(name);
      surname = surname.trim();
      surname = capitalizeFirstLetter(surname);
      email = email.trim().toLowerCase();
      password = password.trim();
      const data = {
        name,
        surname,
        email,
        password,
      };
      //  alert(JSON.stringify(data));
      this.props.onCreateUser(data, this.state.captchaResponse);
    }
  }

  handleValueChange(e) {
    const { name: field, value } = e.target;
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

  verifyCallback(response) {
    this.setState(
      { captchaResponse: response, captchaPending: false },
      this.onSubmit,
    );
  }

  executeCaptcha() {
    if (this.handleValidation(fieldNames)) {
      this.setState(
        {
          captchaPending: true,
        },
        () => this.recaptchaInstance.execute(),
      );
    }
  }

  render() {
    const {
      nameError,
      surnameError,
      passwordError,
      passwordAgainError,
      emailError,
      pending,
    } = this.visibleErrors(fieldNames);

    const loginError = this.props.error ? (
      <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
        <FormattedMessage {...messages.error} />
      </div>
    ) : null;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <FormattedMessage {...messages.title} />
          </h1>
          <Box pad column>
            <fieldset>
              <FormField
                label={<FormattedMessage {...messages.forename} />}
                error={nameError}
              >
                <input
                  type="text"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleValueChange}
                  onBlur={this.handleBlur}
                />
              </FormField>
              <FormField
                label={<FormattedMessage {...messages.surname} />}
                error={surnameError}
              >
                <input
                  type="text"
                  name="surname"
                  autoComplete="family-name"
                  value={this.state.surname}
                  onChange={this.handleValueChange}
                  onBlur={this.handleBlur}
                />
              </FormField>
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
              <FormField
                label={<FormattedMessage {...messages.email} />}
                error={emailError}
              >
                <input
                  id="email"
                  type="text"
                  name="email"
                  autoComplete="email"
                  value={this.state.email}
                  onChange={this.handleValueChange}
                  onBlur={this.handleBlur}
                />
              </FormField>
              {!this.props.notUniqueEmail && loginError}
            </fieldset>

            <Button
              primary
              fill
              onClick={this.executeCaptcha}
              disabled={this.state.captchaPending || pending}
            >
              <FormattedMessage {...messages.nextStep} />
            </Button>
            <Recaptcha // eslint-disable-next-line
              ref={e => (this.recaptchaInstance = e)}
              size="invisible"
              render="explicit"
              sitekey={this.props.recaptchaKey}
              verifyCallback={this.verifyCallback}
              onloadCallback={() =>
                this.setState({
                  captchaPending: false,
                })
              }
              theme="dark"
              badge="inline"
            />
          </Box>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SignUp);
