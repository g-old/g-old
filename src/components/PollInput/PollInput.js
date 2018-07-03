import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import CheckBox from '../CheckBox';
import { utcCorrectedDate } from '../../core/helpers';
import Select from '../Select';
import Button from '../Button';
import FormField from '../FormField';
import { ICONS } from '../../constants';

const messages = defineMessages({
  dateTo: {
    id: 'date.to',
    defaultMessage: 'End date',
    description: 'Date until',
  },
  timeTo: {
    id: 'time.to',
    defaultMessage: 'End time',
    description: 'Time until',
  },
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
const DateInput = ({ dateToError, handleChange, handleBlur, timeToError }) => (
  <div>
    {/*  <p>
      <label htmlFor="dateFrom">DATE FROM</label>
      <input
        type="date"
        defaultValue={utcCorrectedDate().slice(0, 10)}
        onChange={props.handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateFrom"
      />
    </p>
    <p>
      <label htmlFor="timeFrom">TIME FROM</label>
      <input
        type="time"
        defaultValue={utcCorrectedDate().slice(11, 16)}
        onChange={props.handleChange}
        name="timeFrom"
      />
    </p> */}
    <FormField
      label={<FormattedMessage {...messages.dateTo} />}
      error={dateToError}
    >
      <input
        type="date"
        defaultValue={utcCorrectedDate(3).slice(0, 10)}
        onChange={handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateTo"
        onBlur={handleBlur}
      />
    </FormField>
    <FormField
      label={<FormattedMessage {...messages.timeTo} />}
      error={timeToError}
    >
      <input
        type="time"
        name="timeTo"
        defaultValue={utcCorrectedDate().slice(11, 16)}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </FormField>

    {/*  <p>
      <label htmlFor="dateTo">DATE TO</label>
      <input
        type="date"
        defaultValue={utcCorrectedDate(3).slice(0, 10)}
        onChange={props.handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateTo"
      />
    </p>
    <p>
      <label htmlFor="timeTo">TIME TO</label>
      <input
        type="time"
        name="timeTo"
        defaultValue={utcCorrectedDate().slice(11, 16)}
        onChange={props.handleChange}
      />
  </p> */}
  </div>
);

DateInput.propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  dateToError: PropTypes.shape({}),
  timeToError: PropTypes.shape({}),
};
DateInput.defaultProps = {
  dateToError: null,
  timeToError: null,
};

const PollSettings = ({
  withStatements,
  onValueChange,
  secret,
  unipolar,
  threshold,
  thresholdRef,
}) => (
  <div>
    <FormField>
      <CheckBox
        label="with statements"
        checked={withStatements}
        name="withStatements"
        onChange={onValueChange}
      />
      <CheckBox
        label="secret"
        name="secret"
        checked={secret}
        onChange={onValueChange}
      />
      <CheckBox
        name="unipolar"
        label="unipolar"
        checked={unipolar}
        onChange={onValueChange}
      />
    </FormField>

    <FormField
      label={<FormattedMessage {...messages.threshold} />}
      help={threshold}
    >
      <input
        value={threshold}
        onChange={onValueChange}
        min={10}
        step={5}
        max={90}
        type="range"
        name="threshold"
      />
    </FormField>
    <FormField label={<FormattedMessage {...messages.reference} />}>
      <Select
        inField
        options={[
          { value: 'all', label: <span>ALL</span> },
          { value: 'voters', label: <span>VOTERS</span> },
        ]}
        onSearch={false}
        value={{
          value: thresholdRef,
          label: thresholdRef === 'all' ? 'ALL' : 'VOTERS',
        }}
        onChange={e => {
          onValueChange({
            target: { name: 'thresholdRef', value: e.value },
          });
        }}
      />
    </FormField>
  </div>
);

PollSettings.propTypes = {
  withStatements: PropTypes.bool.isRequired,
  secret: PropTypes.bool.isRequired,
  unipolar: PropTypes.bool.isRequired,
  threshold: PropTypes.number.isRequired,
  thresholdRef: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const PollInput = ({
  selectedPMode,
  displaySettings,
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
  if (displaySettings) {
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

      {displaySettings && (
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
  displaySettings: PropTypes.bool,
  selectedPMode: PropTypes.shape({ value: PropTypes.string }).isRequired,
  toggleSettings: PropTypes.func.isRequired,
  pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  intl: PropTypes.shape({ messages: PropTypes.shape({}) }).isRequired,
  formErrors: PropTypes.shape({}).isRequired,
  handleBlur: PropTypes.func.isRequired,
};

PollInput.defaultProps = {
  displaySettings: false,
};

export default PollInput;
