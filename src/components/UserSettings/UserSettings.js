import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import EmailField from './EmailField';
// import Select from '../Select';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
  capitalizeFirstLetter,
} from '../../core/validation';

const fieldNames = [
  'passwordOld',
  'password',
  'passwordAgain',
  'name',
  'surname',
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
  workteams: {
    id: 'settings.groups',
    defaultMessage: 'Workteams',
    description: 'Workteam',
  },
  nameHeading: {
    id: 'label.name',
    defaultMessage: 'Name',
    description: 'Heading of name section',
  },
  name: {
    id: 'settings.name',
    defaultMessage: 'Name',
    description: 'First name',
  },
  surname: {
    id: 'settings.surname',
    defaultMessage: 'Surname',
    description: 'Surname',
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
  },
  showEmailInput: false,
};

class UserSettings extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({})),
      email: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      surname: PropTypes.string,
    }).isRequired,
    updateUser: PropTypes.func.isRequired,
    resendEmail: PropTypes.func.isRequired,
    updates: PropTypes.shape({}).isRequired,
    requestUpdates: PropTypes.shape({}).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onJoinGroup: PropTypes.func.isRequired,
    onLeaveGroup: PropTypes.func.isRequired,
    smallSize: PropTypes.bool.isRequired,
    createRequest: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...initState,
      invalidEmails: [this.props.user.email],
    };
    this.onEditEmail = this.onEditEmail.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleEmailUpdate = this.handleEmailUpdate.bind(this);
    this.handlePasswordUpdate = this.handlePasswordUpdate.bind(this);
    this.handleNameUpdate = this.handleNameUpdate.bind(this);
    const testValues = {
      passwordOld: { fn: 'password' },
      password: { fn: 'password' },
      passwordAgain: { fn: 'passwordAgain' },
      email: { fn: 'email' },
      name: { fn: 'name' },
      surname: { fn: 'name' },
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

  componentWillReceiveProps({ updates, requestUpdates }) {
    if (requestUpdates) {
      if (requestUpdates.error === 'request-email-exists') {
        this.setState({
          showEmailInput: true,
          invalidEmails: [
            ...this.state.invalidEmails,
            this.state.email.trim().toLowerCase(),
          ],
          errors: {
            ...this.state.errors,
            email: {
              touched: true,
              errorName: 'emailTaken',
            },
          },
        });
      } else {
        this.setState({
          emailError: true,
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
              ...this.state.errors,
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
      if (
        (updates.name && updates.name.success) ||
        (updates.surname && updates.surname.success)
      ) {
        this.setState({
          nameSuccess: true,
          nameUpdateError: false,
          name: '',
          surname: '',
        });
      }
      if (
        (updates.name && updates.name.error) ||
        (updates.surname && updates.surname.error)
      ) {
        this.setState({
          nameSuccess: false,
          nameUpdateError: true,
          name: '',
          surname: '',
        });
      }
    }
  }
  onEditEmail() {
    this.setState({
      showEmailInput: !this.state.showEmailInput,
      email: '', // this.props.user.email,
      errors: { ...this.state.errors, email: { touched: false } },
    });
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
  handlePasswordUpdate() {
    if (this.handleValidation(fieldNames.slice(0, 3))) {
      this.props.updateUser({
        id: this.props.user.id,
        passwordOld: this.state.passwordOld.trim(),
        password: this.state.password.trim(),
      });
    }
  }

  handleNameUpdate() {
    const fields = [];

    if (this.state.name) {
      fields.push('name');
    }
    if (this.state.surname) {
      fields.push('surname');
    }
    if (!fields.length) {
      return;
    }
    const args = fields.reduce(
      (acc, curr) => {
        acc[curr] = capitalizeFirstLetter(this.state[curr]);
        return acc;
      },
      { id: this.props.user.id },
    );
    if (this.handleValidation(fields)) {
      this.props.updateUser(args);
    }
  }

  handleEmailUpdate() {
    if (this.handleValidation(['email'])) {
      const newEmail = this.state.email.trim().toLowerCase();
      if (this.props.user.email) {
        if (newEmail !== this.props.user.email.trim().toLowerCase()) {
          // this.props.updateUser({ id: this.props.user.id, email: newEmail });
          this.props.createRequest({
            type: 'changeEmail',
            content: JSON.stringify({
              id: this.props.user.id,
              email: newEmail,
            }),
          });
        }
      }
    }
  }
  render() {
    const { showEmailInput } = this.state;
    const {
      updates,
      requestUpdates,
      user,
      resendEmail,
      deleteRequest,
    } = this.props;
    /* const emailPending = updates && updates.email && updates.email.pending;
    const emailSuccess = updates && updates.email && updates.email.success; */
    const emailPending = requestUpdates && requestUpdates.pending;
    const emailSuccess =
      (updates && updates.verifyEmail && updates.verifyEmail.success) ||
      (requestUpdates && requestUpdates.success);
    const passwordPending =
      updates && updates.password && updates.password.pending;
    const passwordSuccess =
      updates && updates.password && updates.password.success;
    // const verifyError = updates && updates.verifyEmail && updates.verifyEmail.error;
    /* const verifyPending =
      updates && updates.verifyEmail && updates.verifyEmail.pending;
    const verifySuccess =
      updates && updates.verifyEmail && updates.verifyEmail.success;
    const updateEmailBtn = this.state.showEmailInput ? (
      <Button
        disabled={emailPending}
        onClick={this.handleEmailUpdate}
        label={<FormattedMessage {...messages.change} />}
      />
    ) : null; */
    const nameSuccess =
      updates &&
      ((updates.name && updates.name.success) ||
        (updates.surname && updates.surname.success));
    const namePending = updates && updates.name && updates.name.pending;
    const {
      passwordOldError,
      passwordError,
      passwordAgainError,
      emailError,
      nameError,
      surnameError,
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
        <legend>{<FormattedMessage {...messages.nameHeading} />}</legend>
        <fieldset>
          <FormField
            label={<FormattedMessage {...messages.name} />}
            error={nameError}
          >
            <input
              type="text"
              onChange={this.handleValueChange}
              value={this.state.name}
              name="name"
              placeholder={this.props.user.name}
            />
          </FormField>
          <FormField
            label={<FormattedMessage {...messages.surname} />}
            error={surnameError}
          >
            <input
              type="text"
              onChange={this.handleValueChange}
              value={this.state.surname}
              placeholder={this.props.user.surname}
              name="surname"
            />
          </FormField>
        </fieldset>
        <Box justify>
          {!nameSuccess && (
            <Button
              primary
              disabled={namePending}
              onClick={this.handleNameUpdate}
              label={<FormattedMessage {...messages.change} />}
            />
          )}
        </Box>
        <legend>{<FormattedMessage {...messages.emailHeading} />}</legend>
        <EmailField
          smallSize={this.props.smallSize}
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
          value={showEmailInput ? this.state.email : this.props.user.email}
        />
        <legend>{<FormattedMessage {...messages.passwordHeading} />}</legend>

        <fieldset>
          {this.state.passwordError && (
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
              value={this.state.passwordOld}
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
              value={this.state.password}
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
              value={this.state.passwordAgain}
            />
          </FormField>
          {this.state.passwordSuccess && (
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
