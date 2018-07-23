import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import EmailField from './EmailField';
import Select from '../Select';
import { locales } from '../../actions/intl';
import NameInput from './NameInput';
// import Select from '../Select';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
} from '../../core/validation';
import { isAdmin, Groups } from '../../organization';

const fieldNames = [
  'passwordOld',
  'password',
  'passwordAgain',
  'name',
  'surname',
  'locale',
];

const messages = defineMessages({
  currentPassword: {
    id: 'userSettings.oldPW',
    defaultMessage: 'Enter your current password ',
    description: 'Current account password for form label',
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
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },
  email: {
    id: 'settings.email',
    defaultMessage: 'Your current email address',
    description: 'Email label in settings',
  },
  emailNew: {
    id: 'settings.emailNew',
    defaultMessage: 'New email address',
    description: 'Email label in settings for new address',
  },
  wrongPassword: {
    id: 'settings.error.passwordOld',
    defaultMessage: 'Wrong password',
    description: 'Wrong password entered',
  },
  success: {
    id: 'action.success',
    defaultMessage: 'Success!',
    description: 'Short success notification ',
  },
  error: {
    id: 'action.error',
    defaultMessage: 'Action failed. Please retry!',
    description: 'Short failure notification ',
  },
  verified: {
    id: 'settings.email.verified',
    defaultMessage: 'Email verified!',
    description: 'Email got verified ',
  },
  notVerified: {
    id: 'settings.email.notVerified',
    defaultMessage: 'Email not verified',
    description: 'Email not yet verified ',
  },
  resend: {
    id: 'settings.email.resend',
    defaultMessage: 'Resend verification email',
    description: 'Resend verification email ',
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
  nameHeading: {
    id: 'label.name',
    defaultMessage: 'Name',
    description: 'Heading of name section',
  },

  locale: {
    id: 'label.locale',
    defaultMessage: 'Language',
    description: 'Label locale',
  },
});

const initState = {
  passwordSuccess: false,
  password: '',
  passwordOld: '',
  passwordAgain: '',
  email: '',
  name: '',
  surname: '',
  errors: {
    password: { touched: false },
    passwordAgain: { touched: false },
    passwordOld: { touched: false },
    email: { touched: false },
    name: { touched: false },
    surname: { touched: false },
    locale: { touched: false },
  },
  showEmailInput: false,
};

const availableLanguages = Object.keys(locales).map(code => ({
  label: locales[code],
  value: code,
}));

class UserSettings extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      workTeams: PropTypes.arrayOf(PropTypes.shape({})),
      email: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      surname: PropTypes.string,
      locale: PropTypes.string,
    }).isRequired,
    updateUser: PropTypes.func.isRequired,
    resendEmail: PropTypes.func.isRequired,
    updates: PropTypes.shape({}).isRequired,
    requestUpdates: PropTypes.shape({}).isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onJoinWorkTeam: PropTypes.func.isRequired,
    onLeaveWorkTeam: PropTypes.func.isRequired,
    smallSize: PropTypes.bool.isRequired,
    createRequest: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...initState,
      invalidEmails: [props.user.email],
      locale: { label: locales[props.user.locale], value: props.user.locale },
    };
    this.onEditEmail = this.onEditEmail.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleEmailUpdate = this.handleEmailUpdate.bind(this);
    this.handlePasswordUpdate = this.handlePasswordUpdate.bind(this);
    this.handleLocaleUpdate = this.handleLocaleUpdate.bind(this);
    const testValues = {
      passwordOld: { fn: 'password' },
      password: { fn: 'password' },
      passwordAgain: { fn: 'passwordAgain' },
      email: { fn: 'email' },
      name: { fn: 'name' },
      surname: { fn: 'name' },
      locale: { fn: 'noCheck' },
    };
    this.Validator = createValidator(
      testValues,
      {
        password: passwordValidation,
        passwordAgain: passwordAgainValidation,
        email: emailValidation,
        name: nameValidation,
        noCheck: () => {},
      },
      this,
      obj => obj.state,
      {
        minPasswordLength: 6,
      },
    );
  }

  componentWillReceiveProps({ updates, requestUpdates, user }) {
    const { user: oldUser } = this.props;
    const { invalidEmails, email, errors } = this.state;
    if (user.locale !== oldUser.locale) {
      this.setState({
        locale: {
          label: locales[user.locale],
          value: user.locale,
        },
      });
    }
    if (requestUpdates) {
      if (requestUpdates.error === 'request-email-exists') {
        this.setState({
          showEmailInput: true,
          invalidEmails: [...invalidEmails, email.trim().toLowerCase()],
          errors: {
            ...errors,
            email: {
              touched: true,
              errorName: 'emailTaken',
            },
          },
        });
      } else {
        this.setState({
          showEmailInput: false,
        });
      }
    }
    if (updates) {
      if (updates.passwordOld && updates.passwordOld.error) {
        if (updates.passwordOld.error.passwordOld) {
          this.setState({
            passwordOld: '',
            errors: {
              ...errors,
              passwordOld: { touched: true, errorName: 'wrongPassword' },
            },
          });
        } else {
          this.setState({ passwordError: true });
        }
      }
      if (updates.password && updates.password.success) {
        this.setState({
          passwordSuccess: true,
          passwordError: false,
          passwordAgain: '',
          password: '',
          passwordOld: '',
        });
      }
      /* if (updates.locale && updates.locale.success) {
        this.setState({
          localeSuccess: true,
          localeError: false,
        });
      } else if (updates.locale && updates.locale.error) {
        this.setState({
          localeSuccess: false,
          localeError: true,
        });
      } */
      /* if (
        (updates.name && updates.name.success) ||
        (updates.surname && updates.surname.success)
      ) {
        this.setState({
          nameSuccess: true,
          nameUpdateError: false,

        });
      }
      if (
        (updates.name && updates.name.error) ||
        (updates.surname && updates.surname.error)
      ) {
        this.setState({
          nameSuccess: false,
          nameUpdateError: true,

        });
      } */
    }
  }

  onEditEmail() {
    this.setState(prevState => ({
      showEmailInput: !prevState.showEmailInput,
      email: '', // this.props.user.email,
      errors: { ...prevState.errors, email: { touched: false } },
    }));
  }

  handleValueChange(e) {
    const { errors } = this.state;
    const { name: field, value } = e.target;
    if (errors[field].touched) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          [field]: { ...prevState.errors[field], touched: false },
        },
      }));
    }
    this.setState({ [field]: value });
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState(prevState => ({
      errors: { ...prevState.errors, ...validated.errors },
    }));
    return validated.failed === 0;
  }

  handleBlur(e) {
    const { passwordAgain } = this.state;
    const fields = [];
    const currentField = e.target.name;
    fields.push(e.target.name);
    if (currentField) {
      if (currentField === 'password' && passwordAgain.length > 0) {
        fields.push('passwordAgain');
      }
      this.handleValidation(fields);
    }
  }

  visibleErrors(errorNames) {
    const { errors } = this.state;
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (errors[curr].touched) {
        acc[err] = <FormattedMessage {...messages[errors[curr].errorName]} />;
      }
      return acc;
    }, {});
  }

  handlePasswordUpdate() {
    if (this.handleValidation(fieldNames.slice(0, 3))) {
      const { updateUser: update, user } = this.props;
      const { passwordOld, password } = this.state;
      update({
        id: user.id,
        passwordOld: passwordOld.trim(),
        password: password.trim(),
      });
    }
  }

  handleLocaleUpdate() {
    const { user, updateUser: update } = this.props;
    const { locale } = this.state;

    if (user.locale !== locale.value) {
      update({
        id: user.id,
        locale: locale.value,
      });
    }
  }

  handleEmailUpdate() {
    const { email } = this.state;
    const { user, createRequest: makeRequest } = this.props;
    if (this.handleValidation(['email'])) {
      const newEmail = email.trim().toLowerCase();
      if (user.email) {
        if (newEmail !== user.email.trim().toLowerCase()) {
          // this.props.updateUser({ id: this.props.user.id, email: newEmail });
          makeRequest({
            type: 'changeEmail',
            content: JSON.stringify({
              id: user.id,
              email: newEmail,
            }),
          });
        }
      }
    }
  }

  render() {
    const {
      showEmailInput,
      locale,
      email,
      passwordError: passwordUpdateError,
      passwordOld,
      password,
      passwordAgain,
      passwordSuccess: passwordUpdateSuccess,
    } = this.state;
    const {
      updates,
      requestUpdates,
      user,
      resendEmail,
      deleteRequest,
      smallSize,
      updateUser: update,
    } = this.props;

    const canChangeName =
      user && (user.groups === Groups.GUEST || isAdmin(user));

    const emailPending = requestUpdates && requestUpdates.pending;
    const emailSuccess =
      (updates && updates.verifyEmail && updates.verifyEmail.success) ||
      (requestUpdates && requestUpdates.success);
    const passwordPending =
      updates && updates.password && updates.password.pending;
    const passwordSuccess =
      updates && updates.password && updates.password.success;

    const nameSuccess =
      updates &&
      ((updates.name && updates.name.success) ||
        (updates.surname && updates.surname.success));
    const nameError =
      updates &&
      ((updates.name && updates.name.error) ||
        (updates.surname && updates.surname.error));
    const namePending = updates && updates.name && updates.name.pending;

    const localeSuccess = updates && (updates.locale && updates.locale.success);
    const localePending = updates && updates.locale && updates.locale.pending;
    const {
      passwordOldError,
      passwordError,
      passwordAgainError,
      emailError,
      localeError,
    } = this.visibleErrors([...fieldNames, 'email']);

    let emailStatus = null;
    if (!showEmailInput) {
      if (user.emailVerified === true) {
        emailStatus = <FormattedMessage {...messages.verified} />;
      } else {
        emailStatus = <FormattedMessage {...messages.notVerified} />;
      }
    }

    /* const showResendBtn =
      !user.emailVerified && !emailPending && !showEmailInput; */
    const emailChangeRequest =
      user.requests && user.requests.find(r => r.type === 'changeEmail');
    return (
      <Box column pad>
        <legend>{<FormattedMessage {...messages.locale} />}</legend>
        <fieldset>
          <FormField
            label={<FormattedMessage {...messages.locale} />}
            error={localeError}
          >
            <Select
              inField
              options={availableLanguages}
              onSearch={false}
              value={locale}
              onChange={e => {
                this.handleValueChange({
                  target: {
                    name: 'locale',
                    value: e.value,
                  },
                });
              }}
            />
          </FormField>
        </fieldset>
        <Box justify>
          {!localeSuccess && (
            <Button
              primary
              disabled={localePending}
              onClick={this.handleLocaleUpdate}
              label={<FormattedMessage {...messages.change} />}
            />
          )}
        </Box>

        {canChangeName && (
          <React.Fragment>
            <legend>{<FormattedMessage {...messages.nameHeading} />}</legend>

            <NameInput
              updates={{
                error: nameError,
                success: nameSuccess,
                pending: namePending,
              }}
              user={user}
              onUpdate={update}
            />
          </React.Fragment>
        )}

        <legend>{<FormattedMessage {...messages.emailHeading} />}</legend>
        <EmailField
          smallSize={smallSize}
          emailSuccess={emailSuccess}
          request={emailChangeRequest}
          resendEmail={resendEmail}
          deleteRequest={deleteRequest}
          pending={emailPending}
          handleChange={this.handleValueChange}
          emailStatus={emailStatus}
          error={emailError}
          changeEmail={this.handleEmailUpdate}
          onEditEmail={this.onEditEmail}
          emailVerified={user.emailVerified}
          showEmailInput={showEmailInput}
          email={user.email}
          value={showEmailInput ? email : user.email}
        />
        <legend>{<FormattedMessage {...messages.passwordHeading} />}</legend>

        <fieldset>
          {passwordUpdateError && (
            <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
              <FormattedMessage {...messages.error} />
            </div>
          )}
          <FormField
            label={<FormattedMessage {...messages.currentPassword} />}
            error={passwordOldError}
          >
            <input
              name="passwordOld"
              type="password"
              onChange={this.handleValueChange}
              value={passwordOld}
            />
          </FormField>
          <FormField
            label={<FormattedMessage {...messages.password} />}
            error={passwordError}
          >
            <input
              name="password"
              type="password"
              onChange={this.handleValueChange}
              value={password}
            />
          </FormField>
          <FormField
            label={<FormattedMessage {...messages.passwordAgain} />}
            error={passwordAgainError}
          >
            <input
              name="passwordAgain"
              type="password"
              onChange={this.handleValueChange}
              value={passwordAgain}
            />
          </FormField>
          {passwordUpdateSuccess && (
            <div style={{ backgroundColor: 'rgba(140, 200, 0, 0.3)' }}>
              <FormattedMessage {...messages.success} />
            </div>
          )}
        </fieldset>
        <Box justify>
          {!passwordSuccess && (
            <Button
              primary
              disabled={passwordPending}
              onClick={this.handlePasswordUpdate}
              label={<FormattedMessage {...messages.change} />}
            />
          )}
        </Box>
      </Box>
    );
  }
}

export default UserSettings;
