import React from 'react';
import PropTypes from 'prop-types';
import CheckBox from '../CheckBox';
import Icon from '../Icon';
import { utcCorrectedDate } from '../../core/helpers';
import Select from '../Select';

const DateInput = props =>
  (<div>
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
    <p>
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
    </p>

  </div>);

DateInput.propTypes = {
  handleChange: PropTypes.func.isRequired,
};

const PollSettings = props =>
  (<div>
    <h4> Settings </h4>
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
    <p>
      Threshold
      {' '}
      <input
        value={props.threshold}
        onChange={props.onValueChange}
        min={10}
        step={5}
        max={90}
        type="range"
        name="threshold"
      />
      <label htmlFor="thresholdNumber">
        <span name="thresholdNumber">{props.threshold}</span>
      </label>
    </p>
    <p>
      Threshold Reference:
      {' '}
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
        onChange={(e) => {
          props.onValueChange({ target: { name: 'thresholdRef', value: e.value } });
        }}
      />

    </p>
  </div>);

PollSettings.propTypes = {
  withStatements: PropTypes.bool.isRequired,
  secret: PropTypes.bool.isRequired,
  unipolar: PropTypes.bool.isRequired,
  threshold: PropTypes.number.isRequired,
  thresholdRef: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const PollInput = (props) => {
  const selected = props.selectedPMode;
  let settings;
  if (props.displaySettings) {
    const defaultVal = props.defaultPollValues[selected];
    const { withStatements, secret, unipolar, threshold, thresholdRef } = props.pollValues;
    settings = {
      withStatements: withStatements == null ? defaultVal.withStatements : withStatements,
      secret: secret == null ? defaultVal.secret : secret,
      unipolar: unipolar == null ? defaultVal.unipolar : unipolar,
      threshold: threshold == null ? defaultVal.threshold : threshold,
      thresholdRef: thresholdRef == null ? defaultVal.thresholdRef : thresholdRef,
    };
  }
  const msg = props.pollOptions.find(o => o.value === selected);

  const value = {
    label: props.intl.messages[msg.mId] || props.intl.messages,
    value: msg.value,
  };

  return (
    <div>
      <DateInput handleChange={props.handleDateChange} />
      <Select
        options={props.pollOptions}
        onSearch={false}
        value={value}
        onChange={(e) => {
          props.onValueChange({ target: { name: 'pollOption', value: e.value } });
        }}
      />
      {
        <button onClick={props.toggleSettings}>

          <Icon icon="M14 4v-0.5c0-0.825-0.675-1.5-1.5-1.5h-5c-0.825 0-1.5 0.675-1.5 1.5v0.5h-6v4h6v0.5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-0.5h18v-4h-18zM8 8v-4h4v4h-4zM26 13.5c0-0.825-0.675-1.5-1.5-1.5h-5c-0.825 0-1.5 0.675-1.5 1.5v0.5h-18v4h18v0.5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-0.5h6v-4h-6v-0.5zM20 18v-4h4v4h-4zM14 23.5c0-0.825-0.675-1.5-1.5-1.5h-5c-0.825 0-1.5 0.675-1.5 1.5v0.5h-6v4h6v0.5c0 0.825 0.675 1.5 1.5 1.5h5c0.825 0 1.5-0.675 1.5-1.5v-0.5h18v-4h-18v-0.5zM8 28v-4h4v4h-4z" />
        </button>
      }
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
  selectedPMode: PropTypes.string.isRequired,
  toggleSettings: PropTypes.func.isRequired,
  pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  intl: PropTypes.shape({ messages: PropTypes.shape({}) }).isRequired,
};

PollInput.defaultProps = {
  displaySettings: false,
};

export default PollInput;
