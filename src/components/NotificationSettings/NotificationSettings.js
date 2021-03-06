import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { isPushAvailable } from '../../core/helpers';
import FormValidation from '../FormValidation';
import Form from '../Form';
import FormField from '../FormField';
import Label from '../Label';
import CheckBox from '../CheckBox';
import Notification from '../Notification';
import Button from '../Button';
import Box from '../Box';
import Spinner from '../Spinner';

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
  notifications: {
    id: 'label.notifications',
    description: 'Notifications label',
    defaultMessage: 'Notifications',
  },
  availability: {
    id: 'help.pushavailability',
    description: 'Notice',
    defaultMessage: '(available only in Chrome and Firefox browsers)',
  },
  proposalsAndSurveys: {
    id: 'label.proposalAndSurveys',
    defaultMessage: 'Proposals and Surveys',
    description: 'Label proposal and surveys',
  },
  newProposals: {
    id: 'label.newProposals',
    defaultMessage: 'New Proposals',
    description: 'Label new proposals',
  },
  newSurveys: {
    id: 'label.newSurveys',
    defaultMessage: 'New Surveys',
    description: 'Label new surveys',
  },
  onWatchedProposals: {
    id: 'label.onWatchedProposals',
    defaultMessage: 'on watched proposals/surveys',
    description: 'Label for watched proposals/surveys',
  },
  stateUpdates: {
    id: 'label.stateUpdates',
    defaultMessage: 'State updates',
    description: 'Label for state updates',
  },
  statements: {
    id: 'label.notificationSettings.statements',
    defaultMessage: 'Statements',
    description: 'Label for notifications on new statements ',
  },
  discussions: {
    id: 'label.discussions',
    defaultMessage: 'Discussions',
    description: 'Label discussions',
  },

  newDiscussions: {
    id: 'label.newDiscussions',
    defaultMessage: 'New Discussions',
    description: 'Label for notifications on new discussions',
  },
  onWatchedDiscussions: {
    id: 'label.onWatchedDiscussions',
    defaultMessage: 'on watched discussions',
    description: 'Label for notifications on watched discussions',
  },
  comments: {
    id: 'label.notificationSettings.comments',
    defaultMessage: 'Comments',
    description: 'Label for notifications on new comments',
  },
  replies: {
    id: 'label.notificationSettings.replies',
    defaultMessage: 'Replies',
    description: 'Label for notifications on new replies',
  },

  messages: {
    id: 'label.messages',
    defaultMessage: 'Messages',
    description: 'Messages label',
  },
  onMessages: {
    id: 'label.notificationSettings.messages',
    defaultMessage: 'Messages',
    description: 'Label for notifications on new messages',
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

const renderCheckBox = (fullName, type, values, changeFn, disabled) => (
  <CheckBox
    disabled={disabled}
    checked={disabled ? false : values[fullName]}
    label={<FormattedMessage {...messages[type]} />}
    name={fullName}
    onChange={changeFn}
    s
  />
);

class NotificationSettings extends React.Component {
  static propTypes = {
    update: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      notificationSettings: PropTypes.shape({}),
    }).isRequired,
    updates: PropTypes.shape({}).isRequired,
    pushSubscription: PropTypes.shape({ isPushEnabled: PropTypes.bool }),
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
    this.renderCheckBoxPair = this.renderCheckBoxPair.bind(this);
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
    const { notificationSettings } = this.state;

    let mergedSettings = Object.keys(notificationSettings || {}).reduce(
      (acc, key) => {
        if (key in notificationSettings && key in acc) {
          acc[key] = { ...notificationSettings[key], ...acc[key] };
        } else if (key in notificationSettings) {
          acc[key] = notificationSettings[key];
        }
        return acc;
      },
      inputs,
    );
    if (mergedSettings && Object.keys(mergedSettings).length) {
      if (
        this.props.disableSubscription ||
        !this.props.pushSubscription.isPushEnabled
      ) {
        mergedSettings = Object.keys(mergedSettings).reduce((acc, field) => {
          if (field in mergedSettings) {
            if (mergedSettings[field].email) {
              acc[field] = { email: true };
            } else {
              acc[field] = { email: false };
            }
          }
          return acc;
        }, {});
      }
      this.setState({ notificationSettings: mergedSettings });
      this.props.update({
        id: this.props.user.id,
        notificationSettings: JSON.stringify(mergedSettings),
      });
    }
  }
  renderCheckBoxPair(resource, values, changeFn) {
    const { disableSubscription, pushSubscription } = this.props;
    let disabled = false;
    if (disableSubscription) {
      // not available
      disabled = true;
    } else if (!pushSubscription.isPushEnabled) {
      disabled = true;
    }
    return (
      <Box pad>
        {renderCheckBox(`${resource}email`, 'email', values, changeFn)}
        {renderCheckBox(
          `${resource}webpush`,
          'push',
          values,
          changeFn,
          disabled,
        )}
      </Box>
    );
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
          {({ values, handleValueChanges, onSubmit, inputChanged }) => (
            <Form>
              <legend>
                <FormattedMessage {...messages.notifications} />
              </legend>
              <fieldset>
                <FormField
                  label={
                    <span>
                      WebPush {pushSubscription.pending && <Spinner />}
                    </span>
                  }
                  error={pushSubscription.error}
                  help={
                    !isPushAvailable() && (
                      <FormattedMessage {...messages.availability} />
                    )
                  }
                >
                  <CheckBox
                    toggle
                    checked={pushSubscription.isPushEnabled}
                    label={pushSubscription.isPushEnabled ? 'ON' : 'OFF'}
                    onChange={this.props.onPushSubChange}
                    disabled={disableSubscription || pushSubscription.pending}
                  />
                </FormField>
              </fieldset>
              <Label>
                {' '}
                <FormattedMessage {...messages.proposalsAndSurveys} />
              </Label>
              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.newProposals} />}
                >
                  {this.renderCheckBoxPair(
                    'proposal',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
                <FormField
                  label={<FormattedMessage {...messages.newSurveys} />}
                >
                  {this.renderCheckBoxPair(
                    'survey',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
              </fieldset>
              <Label>
                <FormattedMessage {...messages.onWatchedProposals} />
              </Label>
              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.stateUpdates} />}
                >
                  {this.renderCheckBoxPair(
                    'update',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
                <FormField
                  label={<FormattedMessage {...messages.statements} />}
                >
                  {this.renderCheckBoxPair(
                    'statement',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
              </fieldset>
              <Label>
                <FormattedMessage {...messages.discussions} />
              </Label>

              <fieldset>
                <FormField
                  label={<FormattedMessage {...messages.newDiscussions} />}
                >
                  {this.renderCheckBoxPair(
                    'discussion',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
              </fieldset>
              <Label>
                <FormattedMessage {...messages.onWatchedDiscussions} />
              </Label>
              <fieldset>
                <FormField label={<FormattedMessage {...messages.comments} />}>
                  {this.renderCheckBoxPair(
                    'comment',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
                <FormField label={<FormattedMessage {...messages.replies} />}>
                  {this.renderCheckBoxPair('reply', values, handleValueChanges)}
                </FormField>
              </fieldset>
              <Label>
                <FormattedMessage {...messages.onMessages} />
              </Label>

              <fieldset>
                <FormField label={<FormattedMessage {...messages.messages} />}>
                  {this.renderCheckBoxPair(
                    'message',
                    values,
                    handleValueChanges,
                  )}
                </FormField>
              </fieldset>

              <p>
                {error && <Notification type="error" message={updates.error} />}
              </p>
              <div>
                {inputChanged && (
                  <Button
                    onClick={onSubmit}
                    disabled={updates.pending || pushSubscription.pending}
                    primary
                    label={<FormattedMessage {...messages.save} />}
                  />
                )}
              </div>
            </Form>
          )}
        </FormValidation>
      </Box>
    );
  }
}

export default NotificationSettings;
