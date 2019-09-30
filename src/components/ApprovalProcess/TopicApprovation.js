// @flow
import React from 'react';
import type { ElementRef } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import FormValidation from '../FormValidation/FormValidation';
import FormField from '../FormField/FormField';
import Box from '../Box/Box';

import Select from '../Select';
import { ApprovalStates } from '../../organization';

import type { ValueType, Callback } from '../ProposalInput';

const messages = defineMessages({
  yes: {
    id: 'command.yes',
    defaultMessage: 'Yes',
    description: 'Positive answer',
  },
  no: {
    id: 'command.no',
    defaultMessage: 'No',
    description: 'Negative answer',
  },
});

type Props = {
  onExit: (ValueType[]) => void,
  data: { topicApproved?: boolean, topicApproved?: boolean },
  callback: Callback,
  stepId: string,
  intl: IntlShape,
  ...ProposalShape,
};

class TopicApprovation extends React.Component<Props> {
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

  onBeforeNextStep: () => boolean;

  onBeforeNextStep() {
    if (this.form && this.form.current) {
      const validationResult = this.form.current.enforceValidation([
        'topicApproved',
      ]);
      if (validationResult.isValid) {
        this.handleNext(validationResult.values);
        return true;
      }
    }
    return false;
  }

  form: ?ElementRef<FormValidation>;

  handleNext: () => void;

  handleNext(values) {
    const { onExit } = this.props;
    if (onExit) {
      onExit([
        {
          name: 'topicApproved',
          value: values.topicApproved,
        },
      ]);
    }
  }

  render() {
    const { data, text, intl } = this.props;
    return (
      <FormValidation
        ref={this.form}
        submit={this.handleNext}
        validations={{
          topicApproved: { args: { required: true } },
        }}
        data={{
          topicApproved: data.topicApproved,
        }}
      >
        {({ handleValueChanges, values, errorMessages }) => (
          <Box column>
            <div dangerouslySetInnerHTML={{ __html: text }} />
            <FormField
              label="Does the topic falls under the competence of the local government?"
              error={errorMessages.topicApprovedError}
            >
              <Select
                inField
                options={[
                  {
                    value: ApprovalStates.TOPIC_APPROVED,
                    label: intl.formatMessage(messages.yes),
                  },
                  {
                    value: ApprovalStates.TOPIC_DENIED,
                    label: intl.formatMessage(messages.no),
                  },
                ]}
                onSearch={false}
                value={values.topicApproved}
                onChange={e => {
                  handleValueChanges({
                    target: { name: 'topicApproved', value: e.value },
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

export default injectIntl(TopicApprovation);
