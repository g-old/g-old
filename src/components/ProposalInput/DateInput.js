import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import FormField from '../FormField';
import { utcCorrectedDate } from '../../core/helpers';
import Box from '../Box';
import FormValidation from '../FormValidation';
import { dateToValidation, timeToValidation } from '../../core/validation';

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
class DateInput extends React.Component {
  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.onBeforeNextStep = this.onBeforeNextStep.bind(this);
    this.form = React.createRef();
  }

  componentDidMount() {
    const { callback, stepId } = this.props;
    if (callback) {
      callback(stepId, this.onBeforeNextStep);
    }
  }

  onBeforeNextStep() {
    if (this.form.current) {
      const validationResult = this.form.current.enforceValidation([
        'dateTo',
        'timeTo',
      ]);
      if (validationResult.isValid) {
        this.handleNext(validationResult.values);
        return true;
      }
    }
    return false;
  }

  handleNext(values) {
    const { onExit, data } = this.props;
    if (onExit) {
      onExit([
        { name: 'dateTo', value: values.dateTo || data.dateTo },
        { name: 'timeTo', value: values.timeTo || data.timeTo },
      ]);
    }
  }

  render() {
    const { data } = this.props;
    return (
      <FormValidation
        submit={this.handleNext}
        validations={{
          dateTo: { fn: dateToValidation },
          timeTo: { fn: timeToValidation },
        }}
        data={data}
        ref={this.form}
      >
        {({ handleValueChanges, errorMessages, onBlur, values }) => (
          <Box column>
            <FormField
              label={<FormattedMessage {...messages.dateTo} />}
              error={errorMessages.dateToError}
            >
              <input
                type="date"
                defaultValue={utcCorrectedDate(3).slice(0, 10)}
                onChange={handleValueChanges}
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                name="dateTo"
                onBlur={onBlur}
                value={values.dateTo || utcCorrectedDate(3).slice(0, 10)}
              />
            </FormField>
            <FormField
              label={<FormattedMessage {...messages.timeTo} />}
              error={errorMessages.timeToError}
            >
              <input
                type="time"
                name="timeTo"
                value={values.timeTo || utcCorrectedDate().slice(11, 16)}
                defaultValue={utcCorrectedDate().slice(11, 16)}
                onChange={handleValueChanges}
                onBlur={onBlur}
              />
            </FormField>
          </Box>
        )}
      </FormValidation>
    );
  }
}
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
