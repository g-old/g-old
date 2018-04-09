import React from 'react';
import PropTypes from 'prop-types';
// import Box from '../Box';
import { connect } from 'react-redux';
import FormValidation from '../FormValidation';
import Form from '../Form';
import FormField from '../FormField';
import Label from '../Label';
import CheckBox from '../CheckBox';
import Notification from '../Notification';
import Button from '../Button';
import Box from '../Box';
import Select from '../Select';

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
              <Label>Proposals and Surveys</Label>
              <fieldset>
                <FormField label="New Proposals">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
                <FormField label="New Surveys">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
              </fieldset>
              <Label>on watched proposals/surveys</Label>
              <fieldset>
                <FormField label="State updates">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                  <Select
                    inField
                    options={[
                      { label: 'All', value: 'ALL' },
                      { label: 'Followees', value: 'FOLLOWEES' },
                    ]}
                    onSearch={false}
                    value={
                      values.proposalSubscriptionSettings || {
                        label: 'All',
                        value: 'ALL',
                      }
                    }
                    onChange={e => {
                      handleValueChanges({
                        target: {
                          name: 'proposalSubscriptionSettings',
                          value: e.value,
                        },
                      });
                    }}
                  />
                </FormField>
                <FormField label="Statements">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                  <Select
                    inField
                    options={[
                      { label: 'All', value: 'ALL' },
                      { label: 'Followees', value: 'FOLLOWEES' },
                    ]}
                    onSearch={false}
                    value={
                      values.statementSubscriptionSettings || {
                        label: 'Followees',
                        value: 'FOLLOWEES',
                      }
                    }
                    onChange={e => {
                      handleValueChanges({
                        target: {
                          name: 'statementSubscriptionSettings',
                          value: e.value,
                        },
                      });
                    }}
                  />
                </FormField>
                <FormField label="Votes">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
              </fieldset>
              <Label>Discussions</Label>

              <fieldset>
                <FormField label="New Discussions">
                  <Box pad>
                    <CheckBox label="E-Mail" />
                    <CheckBox label="Push" />
                  </Box>
                </FormField>
              </fieldset>
              <Label>on watched discussions</Label>
              <fieldset>
                <FormField label="Comments">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
                <FormField label="Replies">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
              </fieldset>
              <Label>Messages</Label>

              <fieldset>
                <FormField label="Messages">
                  <CheckBox label="E-Mail" />
                  <CheckBox label="Push" />
                </FormField>
              </fieldset>
              <Label>Group Events</Label>

              <fieldset>
                <FormField label="Group Events">
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
