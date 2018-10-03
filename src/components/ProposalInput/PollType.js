// @flow
import React from 'react';
import FormValidation from '../FormValidation';
import FormField from '../FormField';
import Select from '../Select';
import Box from '../Box';
import Button from '../Button';
import Navigation from './Navigation';
import PollSettings from './PollSettings';
import type {
  ValueType,
  PollTypeTypes,
  PollSettingsShape,
} from './ProposalInput';

type Props = {
  onExit: (ValueType[]) => void,
  data: { body?: string, title?: string },
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: PollTypeTypes[],
  advancedModeOn: boolean,
};

type State = {
  showSettings?: boolean,
};
const settingFields = [
  'withStatements',
  'secret',
  'unipolar',
  'threshold',
  'thresholdRef',
];

const createNameValuePairs = (fields, values, data) =>
  fields.map(field => ({
    name: field,
    value: field in values ? values[field] : data[field],
  }));

class PollType extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.handleNext = this.handleNext.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.propagatePollTypeChange = this.propagatePollTypeChange.bind(this);
  }

  handleNext: () => void;

  toggleSettings: () => void;

  propagatePollTypeChange: () => void;

  toggleSettings() {
    this.setState(({ showSettings }) => ({ showSettings: !showSettings }));
  }

  handleNext(values: {}) {
    const { onExit, data } = this.props;
    if (onExit) {
      onExit(
        createNameValuePairs(['pollType', ...settingFields], values, data),
      );
    }
  }

  propagatePollTypeChange(
    onChange: ({ target: ValueType }) => void,
    pollType: { value: PollTypeTypes },
  ) {
    const { defaultPollSettings } = this.props;
    const createEvent = name => ({
      target: { name, value: defaultPollSettings[pollType.value][name] },
    });

    settingFields.forEach(fieldName => onChange(createEvent(fieldName)));
  }

  render() {
    const { data, availablePolls, advancedModeOn } = this.props;
    const { showSettings } = this.state;
    return (
      <FormValidation
        submit={this.handleNext}
        validations={{
          pollType: { args: { required: true } },
          withStatements: {},
          secret: {},
          unipolar: {},
          threshold: {},
          thresholdRef: {},
        }}
        data={data}
      >
        {({ handleValueChanges, values, onSubmit, errorMessages }) => (
          <Box column>
            <FormField label="PollType" error={errorMessages.pollTypeError}>
              <Select
                inField
                options={availablePolls}
                onSearch={false}
                value={values.pollType}
                onChange={e => {
                  handleValueChanges({
                    target: {
                      name: 'pollType',
                      value: e.value,
                    },
                  });
                  this.propagatePollTypeChange(handleValueChanges, e.value);
                }}
              />
            </FormField>
            {!showSettings &&
              advancedModeOn && (
                <Button
                  onClick={this.toggleSettings}
                  label="Show advanced settings"
                />
              )}
            {showSettings &&
              advancedModeOn && (
                <PollSettings
                  onValueChange={handleValueChanges}
                  withStatements={values.withStatements}
                  secret={values.secret}
                  threshold={values.threshold}
                  thresholdRef={values.thresholdRef}
                  unipolar={values.unipolar}
                />
              )}
            <Navigation onNext={onSubmit} />
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default PollType;
