import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import FormField from '../FormField';
import { utcCorrectedDate } from '../../core/helpers';

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
});
const DateInput = ({ dateToError, handleChange, handleBlur, timeToError }) => (
  <div>
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

export default DateInput;
