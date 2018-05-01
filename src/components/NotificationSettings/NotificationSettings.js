import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import FormValidation from '../FormValidation';
import Form from '../Form';
import FormField from '../FormField';
import Label from '../Label';
import CheckBox from '../CheckBox';
import Notification from '../Notification';
import Button from '../Button';
import Box from '../Box';

const messages = defineMessages({
  email: {
    id: 'notificationType.email',
    description: 'Label email',
    defaultMessage: 'Email',
  },
  push: {
    id: 'webpush',
    defaultMessage: 'Push',
    description: 'Push label',
  },
  save: {
    id: 'action.save',
    description: 'Label',
    defaultMessage: 'Save',
  },
});

const FIELDS = [
  'proposal',
  'survey',
  'comment',
  'discussion',
  'update',
  'reply',
  'message',
  'statement',
];

const mergeSettings = values => {
  const result = {};
  const setKey = (key, type, name) => {
    const value = values[name];
    if (!(key in result)) {
      result[key] = { [type]: value };
    } else {
      result[key] = { ...result[key], [type]: value };
    }
  };
  Object.keys(values).forEach(settingName => {
    let key;
    // better with regex settingName.match(/Email|Push/)
    const match = settingName.match(/email|webpush/);
    if (match) {
      key = settingName.slice(0, match.index);
      setKey(key, match[0], settingName);
    }
  });
  return result;
};

const flattenSettings = settings =>
  Object.keys(settings).reduce((acc, settingName) => {
    Object.keys(settings[settingName]).forEach(type => {
      if (type in settings[settingName]) {
        acc[settingName + type] = settings[settingName][type];
      }
    });
    return acc;
  }, {});

const generateValidations = fields => {
  let cache;
  return () => {
    if (cache) {
      return cache;
    }
    const validations = fields.reduce((acc, fieldName) => {
      ['email', 'webpush'].forEach(type => {
        acc[fieldName + type] = {};
      });
      return acc;
    }, {});
    cache = validations;
    return validations;
  };
};

const renderCheckBox = (fullName, type, values, changeFn) => (
  <CheckBox
    checked={values[fullName]}
    label={<FormattedMessage {...messages[type]} />}
    name={fullName}
    onChange={changeFn}
    s
  />
);
const renderCheckBoxPair = (resource, values, changeFn) => (
  <Box pad>
    {renderCheckBox(`${resource}email`, 'email', values, changeFn)}
    {renderCheckBox(`${resource}webpush`, 'push', values, changeFn)}
  </Box>
);

class NotificationSettings extends React.Component {
  static propTypes = {
    update: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      notificationSettings: PropTypes.shape({}),
    }).isRequired,
    updates: PropTypes.shape({}).isRequired,
    pushSubscription: PropTypes.shape({}),
    onPushSubChange: PropTypes.func.isRequired,
    disableSubscription: PropTypes.bool,
  };
  static defaultProps = { pushSubscription: null, disableSubscription: null };
  constructor(props) {
    super(props);
    this.handleSubmission = this.handleSubmission.bind(this);

    this.state = {
      notificationSettings: props.user.notificationSettings || {},
    };

    this.validations = generateValidations(FIELDS);
  }

  componentWillReceiveProps({ user, updates }, oldProps) {
    if (user !== oldProps.user) {
      if (!(updates && updates.pending)) {
        this.setState({
          notificationSettings: user.notificationSettings || {},
        });
      }
    }
  }

  handleSubmission(values) {
    const inputs = mergeSettings(values);
    const { notificationSettings } = this.props.user;

    const mergedSettings = Object.keys(notificationSettings || {}).reduce(
      (acc, key) => {
        if (notificationSettings[key] && acc[key]) {
          acc[key] = { ...notificationSettings[key], ...acc[key] };
        } else if (notificationSettings[key]) {
          acc[key] = notificationSettings[key];
        }
        return acc;
      },
      inputs,
    );
    if (mergedSettings && Object.keys(mergedSettings).length) {
      this.setState({ notificationSettings: mergedSettings });
      this.props.update({
        id: this.props.user.id,
        notificationSettings: JSON.stringify(mergedSettings),
      });
    }
  }

  render() {
    const { error } = this.state;
    const { updates = {}, pushSubscription, disableSubscription } = this.props;
    const { notificationSettings } = this.state;
    const validations = this.validations();
    return (
      <Box column align>
        <FormValidation
          updatePending={updates.pending}
          data={flattenSettings(notificationSettings || {})}
          validations={validations}
          submit={this.handleSubmission}
        >
          {({ values, handleValueChanges, onSubmit }) => (
            <Form>
              <legend>Notifications</legend>
              <FormField label="WebPush" error={pushSubscription.error}>
                <CheckBox
                  toggle
                  checked={pushSubscription.isPushEnabled}
                  label={pushSubscription.isPushEnabled ? 'ON' : 'OFF'}
                  onChange={this.props.onPushSubChange}
                  disabled={disableSubscription || pushSubscription.pending}
                />
              </FormField>

              <Label>Proposals and Surveys</Label>
              <fieldset>
                <FormField label="New Proposals">
                  {renderCheckBoxPair('proposal', values, handleValueChanges)}
                </FormField>
                <FormField label="New Surveys">
                  {renderCheckBoxPair('survey', values, handleValueChanges)}
                </FormField>
              </fieldset>
              <Label>on watched proposals/surveys</Label>
              <fieldset>
                <FormField label="State updates">
                  {renderCheckBoxPair('update', values, handleValueChanges)}
                </FormField>
                <FormField label="Statements">
                  {renderCheckBoxPair('statement', values, handleValueChanges)}
                </FormField>
              </fieldset>
              <Label>Discussions</Label>

              <fieldset>
                <FormField label="New Discussions">
                  {renderCheckBoxPair('discussion', values, handleValueChanges)}
                </FormField>
              </fieldset>
              <Label>on watched discussions</Label>
              <fieldset>
                <FormField label="Comments">
                  {renderCheckBoxPair('comment', values, handleValueChanges)}
                </FormField>
                <FormField label="Replies">
                  {renderCheckBoxPair('reply', values, handleValueChanges)}
                </FormField>
              </fieldset>
              <Label>Messages</Label>

              <fieldset>
                <FormField label="Messages">
                  {renderCheckBoxPair('message', values, handleValueChanges)}
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
                  label={<FormattedMessage {...messages.save} />}
                />
              </div>
            </Form>
          )}
        </FormValidation>
      </Box>
    );
  }
}

export default NotificationSettings;
