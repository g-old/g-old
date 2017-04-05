import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import cn from 'classnames';
import s from './SignUp.css';

const messages = defineMessages({
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
    id: 'signup.name',
    defaultMessage: 'Name',
    description: 'Name',
  },
  forename: {
    id: 'signup.forename',
    defaultMessage: 'First',
    description: 'Forename',
  },
  surname: {
    id: 'signup.surname',
    defaultMessage: 'Surname',
    description: 'Surname',
  },
  title: {
    id: 'signup.title',
    defaultMessage: 'Create your account',
    description: 'Title for signup',
  },
  nextStep: {
    id: 'signup.next',
    defaultMessage: 'Next step',
    description: 'Next',
  },
  empty: {
    id: 'signup.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  shortPassword: {
    id: 'signup.error-shortPassword',
    defaultMessage: 'Short passwords are easy to guess. Try one with at least 6 characters ',
    description: 'Help for short passwords',
  },
  passwordMismatch: {
    id: 'signup.error-passwordMismatch',
    defaultMessage: "These passwords don't match. Try again?",
    description: 'Help for mismatching passwords',
  },
  invalidEmail: {
    id: 'signup.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
});

class SignUp extends React.Component {
  static validateEmail(email) {
    // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    // eslint-disable-next-line no-useless-escape
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line max-len
    // http://www.regular-expressions.info/email.html
    // eslint-disable-next-line max-len
    //  let re = /^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}$)[A-Z0-9._%+-]{1,64}@(?:(?=[A-Z0-9-]{1,63}\.)[A-Z0-9]+(?:-[A-Z0-9]+)*\.){1,8}[A-Z]{2,63}$/;
    return re.test(email);
  }

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordAgain: '',
      name: '',
      surname: '',
      email: '',
      errors: {
        password: {
          touched: false,
          error: '',
        },
        passwordAgain: {
          touched: false,
          error: '',
        },
        name: {
          touched: false,
          error: '',
        },
        email: {
          touched: false,
          error: '',
        },
        surname: {
          touched: false,
          error: '',
        },
      },
    };

    this.onEmailChange = this.onEmailChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onPasswordAgainChange = this.onPasswordAgainChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onSurnameChange = this.onSurnameChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.onNameBlur = this.onNameBlur.bind(this);
    this.onSurnameBlur = this.onSurnameBlur.bind(this);
    this.onPasswordBlur = this.onPasswordBlur.bind(this);
    this.onPasswordAgainBlur = this.onPasswordAgainBlur.bind(this);
    this.onEmailBlur = this.onEmailBlur.bind(this);
  }

  onPasswordChange(e) {
    const password = e.target.value;
    if (this.state.errors.password.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          password: { ...this.state.errors.password, touched: false },
        },
      });
    }
    this.setState({ password });
  }
  onPasswordAgainChange(e) {
    const passwordAgain = e.target.value;
    if (this.state.errors.passwordAgain.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          passwordAgain: { ...this.state.errors.passwordAgain, touched: false },
        },
      });
    }
    this.setState({ passwordAgain });
  }
  onNameChange(e) {
    const name = e.target.value;
    if (this.state.errors.name.touched) {
      this.setState({
        errors: { ...this.state.errors, name: { ...this.state.errors.name, touched: false } },
      });
    }
    this.setState({
      name,
    });
  }
  onSurnameChange(e) {
    const surname = e.target.value;
    if (this.state.errors.surname.touched) {
      this.setState({
        errors: { ...this.state.errors, surname: { ...this.state.errors.surname, touched: false } },
      });
    }
    this.setState({ surname });
  }
  onEmailChange(e) {
    const email = e.target.value;
    if (this.state.errors.email.touched) {
      this.setState({
        errors: { ...this.state.errors, email: { ...this.state.errors.email, touched: false } },
      });
    }
    this.setState({ email });
  }
  // TODO validate on blur or in own function?
  onNameBlur() {
    const name = this.validateName();
    this.setState({ errors: { ...this.state.errors, name } });
  }

  onEmailBlur() {
    const email = this.validateEmail();
    this.setState({ errors: { ...this.state.errors, email } });
  }
  onSurnameBlur() {
    const surname = this.validateSurname();
    this.setState({ errors: { ...this.state.errors, surname } });
  }
  onPasswordBlur() {
    const password = this.validatePassword(6);
    this.setState({ errors: { ...this.state.errors, password } });
  }
  onPasswordAgainBlur() {
    const passwordAgain = this.validatePasswordAgain();
    this.setState({ errors: { ...this.state.errors, passwordAgain } });
  }

  onSubmit() {
    const valid = this.validateForm();
    if (valid) {
      let { name, surname, email, password, passwordAgain } = this.state;
      name = name.trim();
      surname = surname.trim();
      email = email.trim();
      password = password.trim();
      passwordAgain = passwordAgain.trim();
      alert(
        JSON.stringify({
          name,
          surname,
          email,
          password,
          passwordAgain,
        }),
      );
    } else {
      alert('FORM not valid');
    }
  }

  validateName() {
    let name = this.state.name;
    name = name.trim();
    let result = {
      touched: false,
    };
    if (!name) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    }
    return result;
  }
  validateSurname() {
    let surname = this.state.surname;
    surname = surname.trim();
    let result = {
      touched: false,
    };
    if (!surname) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    }
    return result;
  }
  validatePassword(minPasswordLength) {
    let password = this.state.password;
    password = password.trim();
    let result = {
      touched: false,
    };
    if (!password) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    } else if (password.length < minPasswordLength) {
      result = {
        touched: true,
        errorName: 'shortPassword',
      };
    }
    return result;
  }
  validatePasswordAgain() {
    let passwordAgain = this.state.passwordAgain;
    passwordAgain = passwordAgain.trim();
    let result = {
      touched: false,
    };
    if (!passwordAgain) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    } else if (this.state.password.trim() !== passwordAgain) {
      result = {
        touched: true,
        errorName: 'passwordMismatch',
      };
    }
    return result;
  }

  validateEmail() {
    let email = this.state.email;
    email = email.trim();
    let result = {
      touched: false,
    };
    if (!email) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    } else if (!SignUp.validateEmail(email)) {
      result = {
        touched: true,
        errorName: 'invalidEmail',
      };
    }
    return result;
  }
  validateForm() {
    // validate each field
    let errors = {};
    let error = false;
    const name = this.validateName();
    if (name.touched) {
      error = true;
    }

    const surname = this.validateSurname();
    if (name.touched) {
      error = true;
    }

    const password = this.validatePassword(6);
    if (password.touched) {
      error = true;
    }

    const passwordAgain = this.validatePasswordAgain();
    if (passwordAgain.touched) {
      error = true;
    }

    const email = this.validateEmail();
    if (email.touched) {
      error = true;
    }
    // if errors, set state, else submit
    if (error) {
      errors = {
        name,
        surname,
        password,
        passwordAgain,
        email,
      };
      this.setState({ errors });
    }
    return error === false;
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1> <FormattedMessage {...messages.title} /></h1>
          <form>
            <fieldset>
              <div className={s.formGroup}>
                <label className={s.label} htmlFor="name">
                  <FormattedMessage {...messages.forename} />
                </label>
                <input
                  className={cn(s.input, this.state.errors.name.touched && s.error)}
                  id="name"
                  type="text"
                  name="name"
                  value={this.state.name}
                  onChange={this.onNameChange}
                  onBlur={this.onNameBlur}
                />
                <div>
                  {this.state.errors.name.touched
                    ? <FormattedMessage {...messages[this.state.errors.name.errorName]} />
                    : ''}
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.label} htmlFor="surname">
                  <FormattedMessage {...messages.surname} />
                </label>
                <input
                  className={cn(s.input, this.state.errors.surname.touched && s.error)}
                  id="surname"
                  type="text"
                  name="surname"
                  value={this.state.surname}
                  onChange={this.onSurnameChange}
                  onBlur={this.onSurnameBlur}
                />
                <div>
                  {this.state.errors.surname.touched
                    ? <FormattedMessage {...messages[this.state.errors.surname.errorName]} />
                    : ''}
                </div>
              </div>
            </fieldset>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="password">
                <FormattedMessage {...messages.password} />
              </label>
              <input
                className={cn(s.input, this.state.errors.password.touched && s.error)}
                id="password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.onPasswordChange}
                onBlur={this.onPasswordBlur}
              />
              <div>
                {this.state.errors.password.touched
                  ? <FormattedMessage {...messages[this.state.errors.password.errorName]} />
                  : ''}
              </div>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="passwordAgain">
                <FormattedMessage {...messages.passwordAgain} />
              </label>
              <input
                className={cn(s.input, this.state.errors.passwordAgain.touched && s.error)}
                id="passwordAgain"
                type="password"
                name="passwordAgain"
                value={this.state.passwordAgain}
                onChange={this.onPasswordAgainChange}
                onBlur={this.onPasswordAgainBlur}
              />
              <div>
                {this.state.errors.passwordAgain.touched
                  ? <FormattedMessage {...messages[this.state.errors.passwordAgain.errorName]} />
                  : ''}
              </div>
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="email">
                <FormattedMessage {...messages.email} />
              </label>
              <input
                className={cn(s.input, this.state.errors.email.touched && s.error)}
                id="email"
                type="text"
                name="email"
                value={this.state.email}
                onChange={this.onEmailChange}
                onBlur={this.onEmailBlur}
              />
              <div>
                {this.state.errors.email.touched
                  ? <FormattedMessage {...messages[this.state.errors.email.errorName]} />
                  : ''}
              </div>
            </div>

          </form>
          <div className={s.formGroup}>
            <button className={s.button} onClick={this.onSubmit}>
              <FormattedMessage {...messages.nextStep} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SignUp);
