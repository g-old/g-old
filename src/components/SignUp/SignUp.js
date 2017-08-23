import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
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
} from '../../core/validation';

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
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
class SignUp extends React.Component {
  static propTypes = {
    onCreateUser: PropTypes.func.isRequired,
    error: PropTypes.bool,
    pending: PropTypes.bool,
    notUniqueEmail: PropTypes.bool,
  };

  static defaultProps = {
    pending: false,
    error: false,
    notUniqueEmail: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordAgain: '',
      name: '',
      surname: '',
      email: '',
      invalidEmails: [],
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
      this.props.onCreateUser(data);
    }
  }

  handleValueChange(e) {
    const field = e.target.name;
    const value = e.target.value;
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
    const {
      nameError,
      surnameError,
      passwordError,
      passwordAgainError,
      emailError,
    } = this.visibleErrors(fieldNames);

    const loginError = this.props.error
      ? <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
          <FormattedMessage {...messages.error} />
        </div>
      : null;
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
              onClick={this.onSubmit}
              disabled={this.props.pending}
            >
              <FormattedMessage {...messages.nextStep} />
            </Button>
          </Box>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SignUp);
