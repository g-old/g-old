import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CheckBox from '../CheckBox';
import FormField from '../FormField';
import Select from '../Select';

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

const PollSettings = ({
  onValueChange,
  secret,
  unipolar,
  threshold,
  thresholdRef,
  referenceOptions,
}) => (
  <div>
    <FormField>
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
        options={referenceOptions}
        onSearch={false}
        value={thresholdRef}
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

export default PollSettings;
