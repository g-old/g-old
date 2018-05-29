import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../FormField';
import Editor from '../MarkdownEditor';

const InputMask = ({ errors, onBlur, locale, handleValueChanges, values }) => {
  const subjectName = `subject${locale}`;
  const editorName = `text${locale}`;

  return (
    <fieldset>
      <FormField label="Subject" error={errors[subjectName]}>
        <input
          name={subjectName}
          type="text"
          onBlur={onBlur}
          value={values[subjectName]}
          onChange={handleValueChanges}
        />
      </FormField>
      <FormField label="Text" error={errors[editorName]}>
        <Editor
          value={values[editorName]}
          name={editorName}
          onChange={handleValueChanges}
        />
      </FormField>
      <FormField label="Preview">
        <div
          style={{ paddingLeft: '1.5em', paddingRight: '1.5em' }}
          dangerouslySetInnerHTML={{ __html: values[editorName].html }}
        />
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
