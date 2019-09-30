// @flow
import React from 'react';
import type { ElementRef } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import FormValidation from '../FormValidation';
import FormField from '../FormField';
import Box from '../Box';
import Image from '../Image';
import Heading from '../Heading';
import { ApprovalStates } from '../../organization';
import Select from '../Select';
import type { ValueType, Callback } from '../ProposalInput';
import type { Value } from './ApprovalProcess';

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
  data: { contentApproved?: Value, topicApproved?: Value },
  callback: Callback,
  stepId: string,
  intl: IntlShape,
  ...ProposalShape,
};

class ContentApprovation extends React.Component<Props> {
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
        'contentApproved',
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
          name: 'contentApproved',
          value: values.contentApproved,
        },
      ]);
    }
  }

  render() {
    const { data, title, text, summary, image, intl } = this.props;
    return (
      <FormValidation
        ref={this.form}
        submit={this.handleNext}
        validations={{
          contentApproved: { args: { required: true } },
        }}
        data={{
          contentApproved: data.contentApproved,
        }}
      >
        {({ handleValueChanges, values, errorMessages }) => (
          <Box column>
            <Heading tag="h3">Title</Heading>
            <div>{title}</div>
            {summary && (
              <div>
                <Heading tag="h3">Summary</Heading>
                <div>{summary}</div>{' '}
              </div>
            )}
            <Heading tag="h3">Text</Heading>

            <div dangerouslySetInnerHTML={{ __html: text }} />
            <div>
              <Heading tag="h3">Image</Heading>
              <Image fit src={image} />
            </div>

            <FormField
              label="Is the content is aligned with our TOS?"
              error={errorMessages.contentApprovedError}
            >
              <Select
                inField
                options={[
                  {
                    value: ApprovalStates.CONTENT_APPROVED,
                    label: intl.formatMessage(messages.yes),
                  },
                  {
                    value: ApprovalStates.CONTENT_DENIED,
                    label: intl.formatMessage(messages.no),
                  },
                ]}
                onSearch={false}
                value={values.contentApproved || data.contentApproved}
                onChange={e => {
                  handleValueChanges({
                    target: { name: 'contentApproved', value: e.value },
                  });
                }}
              />
              {/* <CheckBox
                toggle
                checked={values.contentApproved}
                label="The content is aligned with our TOS"
                name="contentApproved"
                onChange={handleValueChanges}
             /> */}
            </FormField>
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default injectIntl(ContentApprovation);
