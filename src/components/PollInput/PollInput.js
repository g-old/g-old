import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import DateInput from './DateInput';
import PollSettings from './PollSettings';
import Select from '../Select';
import Button from '../Button';
import FormField from '../FormField';
import { ICONS } from '../../constants';

const messages = defineMessages({
  type: {
    id: 'poll.type',
    defaultMessage: 'Poll type',
    description: 'Poll type',
  },
  threshold: {
    id: 'poll.threshold',
    defaultMessage: 'Threshold',
    description: 'Poll threshold',
  },
  reference: {
    id: 'poll.reference',
    defaultMessage: 'Threshold reference',
    description: 'Threshold reference of poll',
  },
});

const PollInput = ({
  selectedPMode,
  showSettings,
  defaultPollValues,
  pollValues,
  pollOptions,
  intl,
  handleDateChange,
  formErrors,
  handleBlur,
  onValueChange,
  toggleSettings,
}) => {
  const selected = selectedPMode;
  let settings;
  if (showSettings) {
    const defaultVal = defaultPollValues[selected.value];
    const {
      withStatements,
      secret,
      unipolar,
      threshold,
      thresholdRef,
    } = pollValues;
    settings = {
      withStatements:
        withStatements == null ? defaultVal.withStatements : withStatements,
      secret: secret == null ? defaultVal.secret : secret,
      unipolar: unipolar == null ? defaultVal.unipolar : unipolar,
      threshold: threshold == null ? defaultVal.threshold : threshold,
      thresholdRef:
        thresholdRef == null ? defaultVal.thresholdRef : thresholdRef,
    };
  }
  const msg = pollOptions.find(o => o.value === selected.value);

  const value = {
    label: intl.messages[msg.mId] || intl.messages,
    value: msg.value,
  };

  //

  return (
    <div>
      <DateInput
        handleChange={handleDateChange}
        {...formErrors}
        handleBlur={handleBlur}
      />
      <FormField label={<FormattedMessage {...messages.type} />}>
        <Select
          inField
          options={pollOptions}
          onSearch={false}
          value={value}
          onChange={e => {
            onValueChange({
              target: { name: 'pollOption', value: e.value },
            });
          }}
        />
      </FormField>
      <Button
        plain
        onClick={toggleSettings}
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <path
              fill="none"
              stroke="#000"
              strokeWidth="2"
              d={ICONS.settings}
            />
          </svg>
        }
      />

      {showSettings && (
        <PollSettings
          onValueChange={onValueChange}
          withStatements={settings.withStatements}
          secret={settings.secret}
          unipolar={settings.unipolar}
          threshold={settings.threshold}
          thresholdRef={settings.thresholdRef}
        />
      )}
    </div>
  );
};

PollInput.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  defaultPollValues: PropTypes.shape({
    withStatements: PropTypes.bool,
    secret: PropTypes.bool,
    unipolar: PropTypes.bool,
    threshold: PropTypes.number,
    thresholdRef: PropTypes.string,
  }).isRequired,
  pollValues: PropTypes.shape({
    withStatements: PropTypes.bool,
    secret: PropTypes.bool,
    unipolar: PropTypes.bool,
    threshold: PropTypes.number,
    thresholdRef: PropTypes.string,
  }).isRequired,
  onValueChange: PropTypes.func.isRequired,
  showSettings: PropTypes.bool,
  selectedPMode: PropTypes.shape({ value: PropTypes.string }).isRequired,
  toggleSettings: PropTypes.func.isRequired,
  pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  intl: PropTypes.shape({ messages: PropTypes.shape({}) }).isRequired,
  formErrors: PropTypes.shape({}).isRequired,
  handleBlur: PropTypes.func.isRequired,
};

PollInput.defaultProps = {
  showSettings: false,
};

export default PollInput;
