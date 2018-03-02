/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import Notification from '../Notification';
import EmailInput from './EmailInput';
import Select from '../Select';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
  capitalizeFirstLetter,
} from '../../core/validation';

const messages = defineMessages({
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

  success: {
    id: 'action.success',
    defaultMessage: 'Success!',
    description: 'Short success notification ',
  },
  save: {
    id: 'action.save',
    defaultMessage: 'Save',
    description: 'Label',
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
});

const initState = {
  email: '',
  errors: {
    email: { touched: false },
  },
};

class EmailField extends React.Component {
  constructor(props) {
    super(props);
    this.onDeleteRequest = this.onDeleteRequest.bind(this);
    this.onResendEmail = this.onResendEmail.bind(this);
    this.onOpenMailInput = this.onOpenMailInput.bind(this);
  }

  onDeleteRequest() {
    const { request, deleteRequest, onEditEmail } = this.props;
    console.log('DELETE RE', { request });
    if (request) {
      deleteRequest({ id: request.id }).then(() => onEditEmail());
    }
  }

  onResendEmail() {
    const { request, resendEmail } = this.props;
    if (request) {
      resendEmail({ requestId: request.id });
    } else {
      resendEmail({ requestId: undefined });
    }
  }

  onOpenMailInput() {
    this.setState({ editAddress: true });
  }
  render() {
    const {
      changeRequested,
      pending,
      error,
      handleChange,
      value,
      showEmailInput,
      buttonLabel,
      emailStatus,
      request,
      resendEmail,
      deleteRequest,
      smallSize,
      emailSuccess,
      emailVerified,
      changeEmail,
      onEditEmail,
      email,
    } = this.props;
    let notifications = [];
    let commandField;
    let input;
    console.log('CHANGEREQUEST', changeRequested);
    const showResendBtn = true;
    if (emailSuccess) {
      const mailAddress = request ? request.content.email : email;
      notifications.push(
        <Notification
          type="success"
          message={
            'New confirmation mail sent to your mail account :' + mailAddress
          }
        />,
      );
    }
    if (request) {
      notifications.push(
        <Notification
          type="alert"
          message={
            'You have requested to change your email to ' +
            request.content.email +
            ' Please click on the link in the email we sent you to the new address'
          }
        />,
      );
      commandField = (
        <Box between={!smallSize} align={smallSize} column={smallSize}>
          <Button
            primary
            disabled={pending}
            onClick={this.onResendEmail}
            label={<FormattedMessage {...messages.resend} />}
          />
          <Button label={'Cancel request'} onClick={this.onDeleteRequest} />
        </Box>
      );
    } else {
      if (!emailVerified) {
        if (showEmailInput) {
          console.log('SHOWEMAILFIELD', showEmailInput);
          commandField = (
            <Box between={!smallSize} align={smallSize} column={smallSize}>
              <Button
                primary
                disabled={pending}
                onClick={changeEmail}
                label={<FormattedMessage {...messages.save} />}
              />
              <Button
                primary
                disabled={pending}
                onClick={onEditEmail}
                label={<FormattedMessage {...messages.cancel} />}
              />
            </Box>
          );
        } else {
          commandField = (
            <Box between={!smallSize} align={smallSize} column={smallSize}>
              <Button
                primary
                disabled={pending}
                onClick={this.onResendEmail}
                label={<FormattedMessage {...messages.resend} />}
              />
              <Button
                primary
                disabled={pending}
                onClick={onEditEmail}
                label={<FormattedMessage {...messages.change} />}
              />
            </Box>
          );
        }
      } else {
        if (showEmailInput) {
          console.log('SHOWEMAILFIELD', showEmailInput);
          commandField = (
            <Box between={!smallSize} align={smallSize} column={smallSize}>
              <Button
                primary
                disabled={pending}
                onClick={changeEmail}
                label={<FormattedMessage {...messages.save} />}
              />
              <Button
                primary
                disabled={pending}
                onClick={onEditEmail}
                label={<FormattedMessage {...messages.cancel} />}
              />
            </Box>
          );
        } else {
          commandField = (
            <Box between={!smallSize} align={smallSize} column={smallSize}>
              <Button
                primary
                disabled={pending}
                onClick={onEditEmail}
                label={<FormattedMessage {...messages.change} />}
              />
            </Box>
          );
        }
      }

      input = (
        <EmailInput
          error={error}
          handleChange={handleChange}
          value={value}
          emailStatus={emailStatus}
          showEmailField={showEmailInput}
        />
      );
    }
    return (
      <Box justify column>
        {notifications}
        {input}
        {commandField}
      </Box>
    );
  }
}

export default EmailField;
