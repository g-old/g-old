// @flow
import React from 'react';
import type { ElementRef } from 'react';
import Textarea from 'react-textarea-autosize'; // TODO replace
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  IntlShape,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import FormValidation from '../FormValidation';
import s from './ProposalBody.css';
import FormField from '../FormField';
import Box from '../Box';
import MainEditor from '../MainEditor';
import { isHtmlEmpty } from '../MessageInput/validationFns';
import type { ValueType, Callback } from './ProposalInput';

const messages = defineMessages({
  title: {
    id: 'label.title',
    defaultMessage: 'Title',
    description: 'Title',
  },
  summary: {
    id: 'label.summary',
    defaultMessage: 'Summary',
    description: 'Summary',
  },
  body: {
    id: 'label.body',
    defaultMessage: 'Text',
    description: 'Text',
  },
  placeholder: {
    id: 'label.enterText',
    defaultMessage: 'Enter some text',
    description: 'Hint to enter text in field',
  },
});

type Props = {
  onExit: (ValueType[]) => void,
  data: { body?: string, title?: string, summary?: string },
  callback: Callback,
  stepId: string,
  storageKey: string,
  withOptions: boolean,
  intl: IntlShape,
};

const bodyValidation = (data, state) => {
  let result = { touched: false };
  if (isHtmlEmpty(data) && !state.withOptions) {
    result = { touched: true, errorName: 'empty' };
  }
  return result;
};

class ProposalBody extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.handleNext = this.handleNext.bind(this);
    this.onBeforeNextStep = this.onBeforeNextStep.bind(this);
    this.form = React.createRef();
  }

  componentDidMount() {
    const { data, callback, stepId, storageKey } = this.props;

    const initialValue = data.body
      ? data.body
      : localStorage.getItem(storageKey) || '<p></p>';
    this.editor.setInitialState(initialValue);
    if (callback) {
      callback(stepId, this.onBeforeNextStep);
    }
  }

  onBeforeNextStep: () => boolean;

  onBeforeNextStep() {
    if (this.form && this.form.current) {
      const validationResult = this.form.current.enforceValidation([
        'body',
        'title',
        'summary',
      ]);
      if (validationResult.isValid) {
        this.handleNext(validationResult.values);
        return true;
      }
    }
    return false;
  }

  storageKey: string;

  editor: MainEditor;

  form: ?ElementRef<FormValidation>;

  handleNext: () => void;

  handleNext(values) {
    const { onExit, data, storageKey } = this.props;
    if (onExit) {
      onExit([
        {
          name: 'body',
          value:
            values.body ||
            data.body ||
            localStorage.getItem(storageKey) ||
            '<p></p>',
        },
        { name: 'title', value: values.title || data.title },
        { name: 'summary', value: values.summary || data.summary },
      ]);
    }
  }

  render() {
    const { data, storageKey, withOptions, intl } = this.props;
    return (
      <FormValidation
        ref={this.form}
        submit={this.handleNext}
        validations={{
          body: { fn: bodyValidation, args: { required: !withOptions } },
          summary: { args: { required: true, min: 5, max: 250 } },
          title: { args: { required: true, min: 3 } },
          withOptions: {}, // hack to circumvent isEmpty check
        }}
        data={{
          body: data.body || localStorage.getItem(storageKey) || '<p></p>',
          title: data.title,
          summary: data.summary,
          withOptions,
        }}
      >
        {({ handleValueChanges, values, errorMessages }) => (
          <Box column>
            <FormField
              label={<FormattedMessage {...messages.title} />}
              error={errorMessages.titleError}
            >
              <input
                name="title"
                type="text"
                value={values.title}
                placeholder={intl.formatMessage({ ...messages.placeholder })}
                onChange={handleValueChanges}
              />
            </FormField>
            <FormField
              error={errorMessages.summaryError}
              label=<FormattedMessage {...messages.summary} />
            >
              <Textarea
                name="summary"
                placeholder={intl.formatMessage({ ...messages.placeholder })}
                useCacheForDOMMeasurements
                value={values.summary}
                onChange={value => {
                  handleValueChanges(value);
                  /* localStorage.setItem(storageKey, value);*/
                }}
                className={s.textEdit}
                minRows={2}
              />
            </FormField>
            <FormField
              error={errorMessages.bodyError}
              label={<FormattedMessage {...messages.body} />}
            >
              <MainEditor
                className={s.editor}
                ref={
                  elm => (this.editor = elm) // eslint-disable-line
                }
                value={values.body}
                placeholder={intl.formatMessage({ ...messages.placeholder })}
                onChange={value => {
                  handleValueChanges({ target: { name: 'body', value } });
                  localStorage.setItem(storageKey, value);
                }}
              />
            </FormField>
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default withStyles(s)(injectIntl(ProposalBody));
