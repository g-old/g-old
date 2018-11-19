// @flow
import React from 'react';
import FormValidation from '../FormValidation';
import FormField from '../FormField';
import Select from '../Select';
import Box from '../Box';
import Button from '../Button';
import PollSettings from './PollSettings';
import CheckBox from '../CheckBox';
import type {
  ValueType,
  PollTypeTypes,
  PollSettingsShape,
  Callback,
} from './ProposalInput';

type PollPresetOption = { value: PollTypeTypes, label: string };
type Props = {
  onExit: (ValueType[]) => void,
  data: { body?: string, title?: string },
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: PollPresetOption[],
  advancedModeOn: boolean,
  stepId: string,
  callback: Callback,
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
  'withOptions',
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
        'pollType',
        ...settingFields,
      ]);
      if (validationResult.isValid) {
        this.handleNext(validationResult.values);
        return true;
      }
    }
    return false;
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

    const referenceOptions = [{ value: 'voters', label: 'VOTERS' }];
    if (data.pollType.value === 'proposed') {
      referenceOptions.push({ value: 'all', label: 'ALL' });
    }
    return (
      <FormValidation
        submit={this.handleNext}
        ref={this.form}
        validations={{
          pollType: { args: { required: true } },
          withStatements: {},
          secret: {},
          unipolar: {},
          threshold: {},
          thresholdRef: {},
          withOptions: {},
        }}
        data={data}
      >
        {({ handleValueChanges, values, errorMessages }) => (
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
            {values.pollType.value === 'survey' && (
              <CheckBox
                name="withOptions"
                onChange={handleValueChanges}
                checked={values.withOptions}
                label="with options"
              />
            )}
            <CheckBox
              name="withStatements"
              onChange={handleValueChanges}
              checked={values.withStatements}
              label="with statements"
            />
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
                  referenceOptions={referenceOptions}
                  onValueChange={handleValueChanges}
                  secret={values.secret}
                  threshold={values.threshold}
                  thresholdRef={values.thresholdRef}
                  unipolar={values.unipolar}
                />
              )}
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default PollType;
