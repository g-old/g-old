import React from 'react';
import PropTypes from 'prop-types';
// import Box from '../Box';
import { connect } from 'react-redux';
import FormValidation from '../FormValidation';
import Form from '../Form';
import FormField from '../FormField';
// import Label from '../Label';
import CheckBox from '../CheckBox';
import Notification from '../Notification';
import Button from '../Button';

import { createSubscription } from '../../actions/subscription';

class NotificationSettings extends React.Component {
  static propTypes = {
    createSubscription: PropTypes.func.isRequired,
    updates: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.handleSubmission = this.handleSubmission.bind(this);
    this.state = {};
  }
  handleSubmission(values) {
    const inputs = {};
    if (values.proposals) {
      inputs.eventType = 'NEW_PROPOSAL';
    }
    this.props.createSubscription(inputs);
  }
  render() {
    const { error } = this.state;
    const { updates = {} } = this.props;
    return (
      <div>
        <FormValidation
          validations={{ proposals: {} }}
          submit={this.handleSubmission}
        >
          {({ values, handleValueChanges, onSubmit }) => (
            <Form>
              <legend>Notifications</legend>
              <FormField label="Notifications">
                <CheckBox
                  name="proposals"
                  toggle
                  checked={values.proposals}
                  onChange={handleValueChanges}
                  label=" Proposals ON"
                />
                <CheckBox toggle label=" Discussions ON" />
                <CheckBox toggle label=" Surveys ON" />
                <CheckBox toggle label=" Messages ON" />
              </FormField>
              <fieldset>
                <FormField label="Notify me on new proposals">
                  <CheckBox label="InBox" />
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
                <FormField label="Notify me on new messages">
                  <CheckBox label="InBox" />
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
                <FormField label="Notify me on new discussions">
                  <CheckBox label="InBox" />
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
                <FormField label="Notify me on new surveys">
                  <CheckBox label="InBox" />
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
              </fieldset>
              <p>
                {error && <Notification type="error" message={updates.error} />}
              </p>
              <div>
                <Button
                  onClick={onSubmit}
                  disabled={updates.pending}
                  primary
                  label="Save"
                />{' '}
                <Button label="Cancel" onClick={this.onCancel} />
              </div>
            </Form>
          )}
        </FormValidation>
      </div>
    );
  }
}
const mapDispatch = {
  createSubscription,
};
export default connect(null, mapDispatch)(NotificationSettings);
