import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import FormField from '../FormField';
import Box from '../Box';
import Button from '../Button';
import FormValidation from '../FormValidation';
import { capitalizeFirstLetter } from '../../core/validation';
import Notification from '../Notification';

const sanitizeName = name => capitalizeFirstLetter(name.trim());

const messages = defineMessages({
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
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
});

class NameInput extends React.Component {
  static propTypes = {
    updates: PropTypes.shape({}),
    user: PropTypes.shape({}).isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    updates: null,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidUpdate() {}

  onSubmit(values) {
    const { onUpdate, user } = this.props;
    let name;
    let surname;
    if (values.name) {
      name = sanitizeName(values.name);
    }
    if (values.surname) {
      surname = sanitizeName(values.surname);
    }
    onUpdate({ name, surname, id: user.id });
  }

  render() {
    const { updates, user } = this.props;
    return (
      <FormValidation
        key={user.id}
        data={{ name: user.name, surname: user.surname }}
        validations={{
          name: { args: { min: 2 } },
          surname: { args: { min: 2 } },
        }}
        submit={this.onSubmit}
      >
        {({
          errorMessages,
          handleValueChanges,
          values,
          onSubmit,
          inputChanged,
        }) => (
          <React.Fragment>
            {updates.error && (
              <Notification type="error" message={updates.error} />
            )}
            <fieldset>
              <FormField
                label={<FormattedMessage {...messages.name} />}
                error={errorMessages.nameError}
              >
                <input
                  type="text"
                  onChange={handleValueChanges}
                  value={values.name}
                  name="name"
                  placeholder={user.name}
                />
              </FormField>
              <FormField
                label={<FormattedMessage {...messages.surname} />}
                error={errorMessages.surnameError}
              >
                <input
                  type="text"
                  onChange={handleValueChanges}
                  value={values.surname}
                  placeholder={user.surname}
                  name="surname"
                />
              </FormField>
            </fieldset>
            <Box justify>
              {inputChanged && (
                <Button
                  primary
                  disabled={updates.pending}
                  onClick={onSubmit}
                  label={<FormattedMessage {...messages.change} />}
                />
              )}
            </Box>
          </React.Fragment>
        )}
      </FormValidation>
    );
  }
}

export default NameInput;
