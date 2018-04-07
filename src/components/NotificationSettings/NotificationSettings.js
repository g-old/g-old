import React from 'react';
// import PropTypes from 'prop-types';
// import Box from '../Box';
import FormValidation from '../FormValidation';
import Form from '../Form';
import FormField from '../FormField';
import Label from '../Label';
import CheckBox from '../CheckBox';

class NotificationSettings extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  render() {
    return (
      <div>
        <FormValidation validations={[{ proposals: {}, hello: {} }]}>
          {({ errorMessages }) => (
            <Form>
              <Label> {'Notify on'} </Label>
              <fieldset>
                <FormField>
                  <CheckBox label="All new proposals" />
                </FormField>
                <FormField error={errorMessages.helloError}>
                  <input name="hello" />
                </FormField>
              </fieldset>
            </Form>
          )}
        </FormValidation>
      </div>
    );
  }
}

export default NotificationSettings;
