// @flow

import React from 'react';
import FormValidation from '../FormValidation';
import FormField from '../FormField';
import Box from '../Box';
import SearchField from '../SearchField';
import { selectValidation } from '../../core/validation';
import ProfilePicture from '../ProfilePicture';
import type { ValueType, Callback } from './ProposalInput';

type Props = {
  onExit: ([ValueType]) => void,
  data: UserShape,
  users: UserShape[],
  onFetchUser: () => Promise<boolean>,
  callback: Callback,
  stepId: string,
};
class SpokesmanInput extends React.Component<Props> {
  constructor(props: Props) {
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
        'spokesman',
      ]);
      if (validationResult.isValid) {
        this.handleNext(validationResult.values);
        return true;
      }
    }
    return false;
  }

  handleNext: () => void;

  handleNext(values: { spokesman?: UserShape }) {
    const { onExit, data } = this.props;
    if (onExit) {
      onExit([{ name: 'spokesman', value: values.spokesman || data }]);
    }
  }

  render() {
    const { users, onFetchUser, data } = this.props;
    return (
      <FormValidation
        ref={this.form}
        submit={this.handleNext}
        validations={{
          spokesman: {
            fn: selectValidation,
            valuesResolver: obj => obj.state.spokesmanValue,
            args: { required: true },
          },
        }}
        data={{ spokesman: data }}
      >
        {({ handleValueChanges, values, errorMessages }) => (
          <Box column>
            <Box justify>
              <ProfilePicture user={values.spokesman} />
            </Box>
            <FormField
              overflow
              label="Spokesman"
              error={errorMessages.spokesmanError}
            >
              <SearchField
                onChange={e =>
                  handleValueChanges({
                    target: {
                      name: 'spokesmanValue',
                      value: e.value,
                    },
                  })
                }
                value={
                  values.spokesman.name &&
                  `${values.spokesman.name} ${values.spokesman.surname}`
                }
                data={users}
                fetch={onFetchUser}
                displaySelected={sel => {
                  handleValueChanges({
                    target: { name: 'spokesman', value: sel },
                  });
                }}
              />
            </FormField>
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default SpokesmanInput;
