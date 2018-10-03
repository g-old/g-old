// @flow
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import FormValidation from '../FormValidation';
import s from './ProposalBody.css';
import FormField from '../FormField';
import Box from '../Box';
import Navigation from './Navigation';
import MainEditor from '../MainEditor';
import { isHtmlEmpty } from '../MessageInput/validationFns';
import type { ValueType } from './ProposalInput';

type Props = {
  onExit: (ValueType[]) => void,
  data: { body?: string, title?: string },
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
    this.storageKey = 'proposalDraft';
  }

  componentDidMount() {
    const initialValue = localStorage.getItem(this.storageKey) || '<p></p>';
    this.editor.setInitialState(initialValue);
  }

  storageKey: string;

  editor: MainEditor;

  handleNext: () => void;

  handleNext(values) {
    const { onExit, data } = this.props;
    if (onExit) {
      onExit([
        {
          name: 'body',
          value:
            values.body ||
            data.body ||
            localStorage.getItem(this.storageKey) ||
            '<p></p>',
        },
        { name: 'title', value: values.title || data.title },
      ]);
    }
  }

  render() {
    const { data } = this.props;
    return (
      <FormValidation
        submit={this.handleNext}
        validations={{
          body: { fn: bodyValidation, args: { required: true } },
          title: { args: { required: true, min: 3 } },
        }}
        data={{
          body: data.body || localStorage.getItem(this.storageKey) || '<p></p>',
          title: data.title,
        }}
      >
        {({ handleValueChanges, values, onSubmit, errorMessages }) => (
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
                  localStorage.setItem(this.storageKey, value);
                }}
              />
            </FormField>
            <Navigation onNext={onSubmit} />
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default withStyles(s)(ProposalBody);
