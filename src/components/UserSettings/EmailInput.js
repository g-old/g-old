/* eslint-disable */
throw new Error("To finish");
import React from "react";
import PropTypes from "prop-types";
import { defineMessages, FormattedMessage } from "react-intl";
import Box from "../Box";
import Button from "../Button";
import FormField from "../FormField";
import Notification from "../Notification";
import Select from "../Select";
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
  capitalizeFirstLetter,
} from "../../core/validation";

const messages = defineMessages({
  invalidEmail: {
    id: "form.error-invalidEmail",
    defaultMessage: "Your email address seems to be invalid",
    description: "Help for email",
  },
  emailTaken: {
    id: "form.error-emailTaken",
    defaultMessage: "Email address already in use",
    description: "Help for not unique email",
  },
  change: {
    id: "commands.change",
    defaultMessage: "Change",
    description: "Short command to change a setting",
  },
  cancel: {
    id: "commands.cancel",
    defaultMessage: "Cancel",
    description: "Short command to cancel a operation",
  },
  email: {
    id: "settings.email",
    defaultMessage: "Your current email address",
    description: "Email label in settings",
  },
  emailNew: {
    id: "settings.emailNew",
    defaultMessage: "New email address",
    description: "Email label in settings for new address",
  },

  success: {
    id: "action.success",
    defaultMessage: "Success!",
    description: "Short success notification ",
  },
  error: {
    id: "action.error",
    defaultMessage: "Action failed. Please retry!",
    description: "Short failure notification ",
  },
  verified: {
    id: "settings.email.verified",
    defaultMessage: "Email verified!",
    description: "Email got verified ",
  },
  notVerified: {
    id: "settings.email.notVerified",
    defaultMessage: "Email not verified",
    description: "Email not yet verified ",
  },
  resend: {
    id: "settings.email.resend",
    defaultMessage: "Resend verification email",
    description: "Resend verification email ",
  },
});

const initState = {
  email: "",
  errors: {
    email: { touched: false },
  },
};
class EmailInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleEmailEditing = this.handleEmailEditing.bind(this);
    this.handleVerificationSending = this.handleVerificationSending.bind(this);
    this.state = {
      editing: false,
      ...initState,
      invalidEmails: [props.actualEmail],
    };

    const testValues = {
      passwordOld: { fn: "password" },
      password: { fn: "password" },
      passwordAgain: { fn: "passwordAgain" },
      email: { fn: "email" },
      name: { fn: "name" },
      surname: { fn: "name" },
    };
    this.Validator = createValidator(
      testValues,
      {
        email: emailValidation,
      },
      this,
      obj => obj.state,
    );
  }

  componentWillReceiveProps({ isVerified }) {
    if (isVerified !== this.props.isVerified) {
      console.log("VERF FAIL", { isVerified, old: this.props.isVerified });
      this.setState({ editing: false });
    }
  }

  handleEmailEditing() {
    this.setState({ editing: !this.state.editing });
    this.props.onEmailInputActive();
  }
  handleVerificationSending() {
    this.props.sendEmail();
  }
  render() {
    const {
      error,
      isVerified,
      pending,
      onEmailInput,
      email,
      actualEmail,
      success,
    } = this.props;
    const { editing } = this.state;
    let actionBtns = [];
    if (isVerified) {
      actionBtns.push(
        <Button
          primary
          disabled={pending}
          onClick={this.handleEmailEditing}
          label={<FormattedMessage {...messages.change} />}
        />,
      );
    } else {
      console.log("NVERIFIS", this.props);
      actionBtns = [
        <Button
          primary
          disabled={pending}
          onClick={this.handleVerificationSending}
          label={<FormattedMessage {...messages.resend} />}
        />,
        <Button
          primary
          disabled={pending}
          onClick={this.handleEmailEditing}
          label={<FormattedMessage {...messages.change} />}
        />,
      ];
    }
    if (editing) {
      actionBtns.shift();
      actionBtns.unshift(
        <Button
          primary
          disabled={pending}
          onClick={this.handleEmailEditing}
          label={<FormattedMessage {...messages.cancel} />}
        />,
      );
      actionBtns.push(
        <Button
          primary
          disabled={pending}
          onClick={this.onEmailUpdate}
          label={<FormattedMessage {...messages.change} />}
        />,
      );
    }

    let notification;
    if (error) {
      notification = <Notification type="error" message={error} />;
    } else if (success) {
      notification = (
        <Notification
          type="success"
          message={"Check your mailbox to confirm!"}
        />
      );
    }
    return (
      <Box column pad>
        <fieldset>
          {this.state.emailError && (
            <div style={{ backgroundColor: "rgba(255, 50, 77, 0.3)" }}>
              <FormattedMessage {...messages.error} />
            </div>
          )}
          <FormField
            label={<FormattedMessage {...messages.email} />}
            error={error}
            help={
              <FormattedMessage
                {...messages[isVerified ? "verified" : "notVerified"]}
              />
            }
          >
            <input
              type="text"
              onChange={onEmailInput}
              value={editing ? email : actualEmail}
              name="email"
              readOnly={!editing}
            />
          </FormField>
        </fieldset>

        <Box wrap justify>
          {notification || actionBtns}
        </Box>
      </Box>
    );
  }
}

export default EmailInput;
