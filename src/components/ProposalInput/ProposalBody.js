// @flow
import React from 'react';
import type { ElementRef } from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import FormValidation from '../FormValidation';
import s from './ProposalBody.css';
import FormField from '../FormField';
import Box from '../Box';
import MainEditor from '../MainEditor';
import { isHtmlEmpty } from '../MessageInput/validationFns';
import type { ValueType, Callback } from './ProposalInput';

type Props = {
  onExit: (ValueType[]) => void,
  data: { body?: string, title?: string },
  callback: Callback,
  stepId: string,
  storageKey: string,
  withOptions: boolean,
};

const bodyValidation = data => {
  let result = { touched: false };
  if (isHtmlEmpty(data)) {
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
      ]);
    }
  }

  render() {
    const { data, storageKey, withOptions } = this.props;
    return (
      <FormValidation
        ref={this.form}
        submit={this.handleNext}
        validations={{
          body: { fn: bodyValidation, args: { required: !withOptions } },
          title: { args: { required: true, min: 3 } },
        }}
        data={{
          body: data.body || localStorage.getItem(storageKey) || '<p></p>',
          title: data.title,
        }}
      >
        {({ handleValueChanges, values, errorMessages }) => (
          <Box column>
            <FormField label="Title" error={errorMessages.titleError}>
              <input
                name="title"
                type="text"
                value={values.title}
                onChange={handleValueChanges}
              />
            </FormField>
            <FormField error={errorMessages.bodyError} label="Body">
              <MainEditor
                className={s.editor}
                ref={
                  elm => (this.editor = elm) // eslint-disable-line
                }
                value={values.body}
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

export default withStyles(s)(ProposalBody);
