import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../FormField';
import Editor from '../MainEditor';
import Message from '../Message';

const InputMask = ({ errors, onBlur, locale, handleValueChanges, values }) => {
  const subjectName = `subject${locale}`;
  const editorName = `text${locale}`;
  const subject = values[subjectName];
  return (
    <fieldset>
      <FormField label="Subject" error={errors[subjectName]}>
        <input
          name={subjectName}
          type="text"
          onBlur={onBlur}
          value={subject}
          onChange={handleValueChanges}
        />
      </FormField>
      <FormField label="Text" error={errors[editorName]}>
        <Editor
          value={values[editorName]}
          onChange={value => {
            this.handleValueChanges({ target: { name: 'body', value } });
            localStorage.setItem(this.storageKey, value);
          }}
        />
      </FormField>
      <FormField label="Preview">
        <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          <Message subject={subject} content={values[editorName].html} />
        </div>
      </FormField>
    </fieldset>
  );
};

InputMask.propTypes = {
  errors: PropTypes.shape({}).isRequired,
  onBlur: PropTypes.func.isRequired,
  handleValueChanges: PropTypes.func.isRequired,
  locale: PropTypes.oneOfType(['De', 'It']).isRequired,
  values: PropTypes.shape({}).isRequired,
};

export default InputMask;
