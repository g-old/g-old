import React from 'react';
import PropTypes from 'prop-types';
import Recaptcha from 'react-recaptcha';

import { defineMessages, FormattedMessage } from 'react-intl';
import Button from '../Button';
import FormField from '../FormField';
import Box from '../Box';
import Form from '../Form';
import Label from '../Label';
import Header from '../Header2';
import Heading from '../Heading';
import { ICONS } from '../../constants';

import {
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  capitalizeFirstLetter,
} from '../../core/validation';
import CheckBox from '../CheckBox';
import FormValidation from '../FormValidation';

const SCRIPT_ID = 'gold-recaptcha-script';
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
  error: {
    id: 'signup.error',
    defaultMessage: 'Could not create your account',
    description: 'Default signup error message',
  },
  emailHeading: {
    id: 'label.email',
    defaultMessage: 'Email',
    description: 'Heading of email section',
  },
  passwordHeading: {
    id: 'label.password',
    defaultMessage: 'Password',
    description: 'Heading of password section',
  },
  consent: {
    id: 'privacy.consent',
    defaultMessage: 'I accept the {policy}',
    description: 'Signup consent notice',
  },
  privacy: {
    id: 'privacy',
    description: 'Privacy label',
    defaultMessage: 'Privacy',
  },

  readPrivacy: {
    id: 'privacy.readCall',
    defaultMessage: 'Read our {link}',
    description: 'Call to read linked privac policy',
  },
});

const PATH_TO_PRIVACY = '/privacy';

const onBlurValidation = (fieldName, state, fields) => {
  if (fieldName && state) {
    if (fieldName === 'password' && state.passwordAgain.length > 0) {
      fields.push('passwordAgain');
    }
  }
};

const consentValidation = consent => {
  if (consent) {
    return {
      touched: false,
    };
  }
  return { touched: true, errorName: 'empty' };
};

class SignUp extends React.Component {
  static removeScript() {
    const script = document.getElementById(SCRIPT_ID);
    if (script) {
      script.parentNode.removeChild(script);
    }
  }

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

  constructor(props) {
    super(props);
    this.state = {
      invalidEmails: [],
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.executeCaptcha = this.executeCaptcha.bind(this);
    this.resetRecaptcha = this.resetRecaptcha.bind(this);
    this.handlePasswordVisibility = this.handlePasswordVisibility.bind(this);
    this.handleInvalidEmail = this.handleInvalidEmail.bind(this);
  }

  componentDidMount() {
    this.renderScript();
  }

  componentWillReceiveProps({ notUniqueEmail }) {
    if (notUniqueEmail) {
      const { validatedInputs } = this.state;
      if (validatedInputs && validatedInputs.email) {
        this.setState(
          prevState => ({
            invalidEmails: [
              ...prevState.invalidEmails,
              prevState.validatedInputs.email.trim().toLowerCase(),
            ],
          }),
          this.handleInvalidEmail,
        );
      }
    }
  }

  componentWillUnmount() {
    // SignUp.removeScript();
  }

  onSubmit() {
    const { validatedInputs, captchaResponse } = this.state;
    const { onCreateUser } = this.props;
    if (validatedInputs) {
      let { name, surname, email, password } = validatedInputs;
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
      onCreateUser(data, captchaResponse);
    }
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  handleInvalidEmail() {
    this.resetRecaptcha();
    const { invalidEmails } = this.state;
    this.form.enforceValidation(['email'], {
      invalidEmails,
    });
  }

  verifyCallback(response) {
    this.setState(
      { captchaResponse: response, captchaPending: false },
      this.onSubmit,
    );
  }

  executeCaptcha(values) {
    this.setState(
      {
        validatedInputs: values,
        captchaPending: true,
      },
      () => this.recaptchaInstance.execute(),
    );
  }

  handlePasswordVisibility(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState(prevState => ({
      passwordsVisible: !prevState.passwordsVisible,
    }));
  }

  resetRecaptcha() {
    if (this.recaptchaInstance) {
      this.recaptchaInstance.reset();
    }
  }

  renderScript() {
    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      script.id = SCRIPT_ID;
      document.body.appendChild(script);
    } else {
      this.resetRecaptcha();
    }
  }

  render() {
    const { pending, error, notUniqueEmail, recaptchaKey } = this.props;
    const {
      hasError,
      invalidEmails,
      passwordsVisible,
      captchaPending,
    } = this.state;

    const loginError = error ? (
      <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
        <FormattedMessage {...messages.error} />
      </div>
    ) : null;
    if (hasError) {
      return <h1>Please reload the page</h1>;
    }
    return (
      <Box tag="article" align column pad>
        <FormValidation // eslint-disable-next-line
          ref={el => (this.form = el)}
          eager
          onBlur={onBlurValidation}
          options={{ invalidEmails }}
          validations={{
            name: { args: { required: true, min: 2 } },
            surname: { args: { required: true, min: 2 } },
            password: {
              fn: passwordValidation,
              args: { required: true, min: 6 },
            },
            passwordAgain: {
              fn: passwordAgainValidation,
              args: { required: true, min: 6 },
            },
            email: { fn: emailValidation, args: { required: true } },
            consent: { fn: consentValidation, args: { required: true } },
          }}
          submit={this.executeCaptcha}
        >
          {({
            errorMessages,
            onBlur,
            handleValueChanges,
            values,
            onSubmit,
          }) => (
            <Form onSubmit={onSubmit}>
              <Header align between>
                <Heading tag="h2" strong>
                  <FormattedMessage {...messages.title} />
                </Heading>
              </Header>
              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.forename} />}
                  error={errorMessages.nameError}
                >
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>
                <FormField
                  label={<FormattedMessage {...messages.surname} />}
                  error={errorMessages.surnameError}
                >
                  <input
                    type="text"
                    name="surname"
                    autoComplete="family-name"
                    value={values.surname}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>
              </fieldset>

              <Label>
                <FormattedMessage {...messages.passwordHeading} />
              </Label>
              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.password} />}
                  error={errorMessages.passwordError}
                >
                  <input
                    id="password"
                    type={passwordsVisible ? 'text' : 'password'}
                    name="password"
                    value={values.password}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>
                <FormField
                  label={<FormattedMessage {...messages.passwordAgain} />}
                  error={errorMessages.passwordAgainError}
                  help={
                    <Button
                      plain
                      onClick={this.handlePasswordVisibility}
                      icon={
                        <svg
                          fill="#0000008a"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="https://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z"
                            fill="none"
                          />
                          <path
                            d={
                              ICONS[
                                passwordsVisible
                                  ? 'visibility'
                                  : 'visibilityOff'
                              ]
                            }
                          />
                        </svg>
                      }
                    />
                  }
                >
                  <input
                    id="passwordAgain"
                    type={passwordsVisible ? 'text' : 'password'}
                    name="passwordAgain"
                    value={values.passwordAgain}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>
              </fieldset>
              <Label>
                <FormattedMessage {...messages.emailHeading} />
              </Label>
              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.email} />}
                  error={errorMessages.emailError}
                >
                  <input
                    id="email"
                    type="text"
                    name="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>
                {!notUniqueEmail && loginError}
              </fieldset>
              <fieldset>
                <FormField
                  error={errorMessages.consentError}
                  help={
                    <FormattedMessage
                      {...messages.readPrivacy}
                      values={{
                        link: (
                          <a
                            target="_blank"
                            href={PATH_TO_PRIVACY}
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage {...messages.privacy} />
                          </a>
                        ),
                      }}
                    />
                  }
                >
                  <CheckBox
                    label={
                      <FormattedMessage
                        {...messages.consent}
                        values={{
                          policy: <FormattedMessage {...messages.privacy} />,
                        }}
                      />
                    }
                    checked={values.consent}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                    name="consent"
                  />
                </FormField>
              </fieldset>
              <p>
                <a
                  target="_blank"
                  href={PATH_TO_PRIVACY}
                  rel="noopener noreferrer"
                >
                  <FormattedMessage {...messages.privacy} />
                </a>
              </p>

              <Button primary fill disabled={captchaPending || pending}>
                <FormattedMessage {...messages.nextStep} />
              </Button>
            </Form>
          )}
        </FormValidation>
        <Recaptcha
          ref={
            e => (this.recaptchaInstance = e) // eslint-disable-line
          }
          size="invisible"
          render="explicit"
          sitekey={recaptchaKey}
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
    );
  }
}

export default SignUp;
