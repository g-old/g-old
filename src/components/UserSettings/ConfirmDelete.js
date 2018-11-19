import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import FormValidation from '../FormValidation';
import ConfirmLayer from '../ConfirmLayer';
import FormField from '../FormField';
import Notification from '../Notification';
import { passwordValidation } from '../../core/validation';
import Box from '../Box';

const messages = defineMessages({
  password: {
    id: 'userSettings.oldPW',
    defaultMessage: 'Enter your current password ',
    description: 'Current account password for form label',
  },
  irreversible: {
    id: 'irreversible',
    defaultMessage: 'Cannot be undone! ',
    description: 'Action which can not be undone',
  },
});

class ConfirmDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = { invalidPasswords: [] };
    this.form = React.createRef();
    this.handleDelete = this.handleDelete.bind(this);
    this.handleInvalidPassword = this.handleInvalidPassword.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { invalidPassword } = this.props;
    if (invalidPassword && !prevProps.invalidPassword) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        prevState => ({
          invalidPasswords: [
            ...prevState.invalidPasswords,
            prevState.validated.currentPassword.trim(),
          ],
        }),
        this.handleInvalidPassword,
      );
    }
  }

  handleInvalidPassword() {
    const { invalidPasswords } = this.state;
    this.form.current.enforceValidation(['currentPassword'], {
      invalidPasswords,
    });
  }

  handleDelete(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { onDelete } = this.props;
    const result = this.form.current.enforceValidation();
    if (result.isValid) {
      onDelete(result.values.currentPassword);
      this.setState({ validated: result.values });
    }
  }

  render() {
    const { onClose, updates } = this.props;
    const { invalidPasswords } = this.state;
    return (
      <ConfirmLayer
        onSubmit={this.handleDelete}
        onClose={onClose}
        pending={updates.pending}
      >
        <Box column>
          <Notification
            type="alert"
            message={<FormattedMessage {...messages.irreversible} />}
          />

          <FormValidation
            ref={this.form}
            validations={{
              currentPassword: {
                fn: passwordValidation,
                args: { required: true },
              },
            }}
            options={{ invalidPasswords }}
          >
            {({ handleValueChanges, values, errorMessages, onBlur }) => (
              <FormField
                label={<FormattedMessage {...messages.password} />}
                error={errorMessages.currentPasswordError}
              >
                <input
                  onBlur={onBlur}
                  name="currentPassword"
                  type="password"
                  onChange={handleValueChanges}
                  value={values.currentPassword}
                />
              </FormField>
            )}
          </FormValidation>
        </Box>
      </ConfirmLayer>
    );
  }
}

export default ConfirmDelete;
