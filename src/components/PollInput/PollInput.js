import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import CheckBox from '../CheckBox';
import { utcCorrectedDate } from '../../core/helpers';
import Select from '../Select';
import Button from '../Button';
import FormField from '../FormField';

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
const DateInput = props =>
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
      error={props.dateToError}
    >
      <input
        type="date"
        defaultValue={utcCorrectedDate(3).slice(0, 10)}
        onChange={props.handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateTo"
        onBlur={props.handleBlur}
      />
    </FormField>
    <FormField
      label={<FormattedMessage {...messages.timeTo} />}
      error={props.timeToError}
    >
      <input
        type="time"
        name="timeTo"
        defaultValue={utcCorrectedDate().slice(11, 16)}
        onChange={props.handleChange}
        onBlur={props.handleBlur}
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
  </div>;

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

const PollSettings = props =>
  <div>
    <FormField>
      <CheckBox
        label={'with statements'}
        checked={props.withStatements}
        name="withStatements"
        onChange={props.onValueChange}
      />
      <CheckBox
        label={'secret'}
        name="secret"
        checked={props.secret}
        onChange={props.onValueChange}
      />
      <CheckBox
        name="unipolar"
        label={'unipolar'}
        checked={props.unipolar}
        onChange={props.onValueChange}
      />
    </FormField>

    <FormField
      label={<FormattedMessage {...messages.threshold} />}
      help={props.threshold}
    >
      <input
        value={props.threshold}
        onChange={props.onValueChange}
        min={10}
        step={5}
        max={90}
        type="range"
        name="threshold"
      />
    </FormField>
    <FormField label={<FormattedMessage {...messages.reference} />}>
      <Select
        options={[
          { value: 'all', label: <span>ALL</span> },
          { value: 'voters', label: <span>VOTERS</span> },
        ]}
        onSearch={false}
        value={{
          value: props.thresholdRef,
          label: props.thresholdRef === 'all' ? 'ALL' : 'VOTERS',
        }}
        onChange={e => {
          props.onValueChange({
            target: { name: 'thresholdRef', value: e.value },
          });
        }}
      />
    </FormField>
  </div>;

PollSettings.propTypes = {
  withStatements: PropTypes.bool.isRequired,
  secret: PropTypes.bool.isRequired,
  unipolar: PropTypes.bool.isRequired,
  threshold: PropTypes.number.isRequired,
  thresholdRef: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const PollInput = props => {
  const selected = props.selectedPMode;
  let settings;
  if (props.displaySettings) {
    const defaultVal = props.defaultPollValues[selected.value];
    const {
      withStatements,
      secret,
      unipolar,
      threshold,
      thresholdRef,
    } = props.pollValues;
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
  const msg = props.pollOptions.find(o => o.value === selected.value);

  const value = {
    label: props.intl.messages[msg.mId] || props.intl.messages,
    value: msg.value,
  };

  return (
    <div>
      <DateInput
        handleChange={props.handleDateChange}
        {...props.formErrors}
        handleBlur={props.handleBlur}
      />
      <FormField label={<FormattedMessage {...messages.type} />}>
        <Select
          options={props.pollOptions}
          onSearch={false}
          value={value}
          onChange={e => {
            props.onValueChange({
              target: { name: 'pollOption', value: e.value },
            });
          }}
        />
      </FormField>
      <Button
        plain
        onClick={props.toggleSettings}
        icon={
          <svg v viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <path
              fill="none"
              stroke="#000"
              strokeWidth="2"
              d="M12,9 L12,0 M15,12 L24,12 M0,12 L9,12 M12,24 L12,15 M12,21 C16.9705627,21 21,16.9705627 21,12 C21,7.02943725 16.9705627,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 Z M3.5,8.5 L1,7.5 M20.5,15.5 L23,16.5 M3,3 L5.5,5.5 M3,3 L5.5,5.5 M18,18 L20.5,20.5 M20.5,3 L18,5.5 M5.5,18 L3,20.5 M12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 Z M20.5,8.5 L23,7.5 M15.5,3.5 L16.5,1 M15.5,20.5 L16.5,23 M8.5,20.5 L7.5,23 M3.5,15.5 L1,16.5 M8.5,3.5 L7.5,1"
            />
          </svg>
        }
      />

      {props.displaySettings &&
        <PollSettings
          onValueChange={props.onValueChange}
          withStatements={settings.withStatements}
          secret={settings.secret}
          unipolar={settings.unipolar}
          threshold={settings.threshold}
          thresholdRef={settings.thresholdRef}
        />}
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
