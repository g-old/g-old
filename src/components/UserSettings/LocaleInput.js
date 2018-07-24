import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { locales } from '../../actions/intl';
import FormField from '../FormField';
import Box from '../Box';
import Button from '../Button';
import FormValidation from '../FormValidation';
import Notification from '../Notification';
import Select from '../Select';

const availableLanguages = Object.keys(locales).map(code => ({
  label: locales[code],
  value: code,
}));
const messages = defineMessages({
  locale: {
    id: 'label.locale',
    defaultMessage: 'Language',
    description: 'Label locale',
  },
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
});

class LocaleInput extends React.Component {
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

  onSubmit(values) {
    const { onUpdate, user } = this.props;
    let locale;
    if (values.locale) {
      locale = values.locale.value;
      if (locale && locale !== user.locale) {
        onUpdate({ locale, id: user.id });
      }
    }
  }

  render() {
    const { updates, user } = this.props;
    return (
      <FormValidation
        key={user.id}
        data={{ locale: locales[user.locale] }}
        validations={{ locale: { args: { required: true } } }}
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
                label={<FormattedMessage {...messages.locale} />}
                error={errorMessages.localeError}
              >
                <Select
                  inField
                  options={availableLanguages}
                  onSearch={false}
                  value={values.locale}
                  onChange={e => {
                    handleValueChanges({
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

export default LocaleInput;
