import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './MessageForm.css';
import Box from '../Box';
import FormValidation from '../FormValidation';
import Button from '../Button';
import FormField from '../FormField';

const messages = defineMessages({
  send: {
    id: 'command.submit',
    description: 'Short command for sending data to the server',
    defaultMessage: 'Submit',
  },
});

const MessageForm = ({ updates, onSend }) => (
  <div className={s.root}>
    <FormValidation
      submit={onSend}
      validations={{ text: { args: { required: true } } }}
      data={{ text: '' }}
    >
      {({ values, onSubmit, handleValueChanges, errorMessages }) => (
        <Box column>
          <FormField label="Reply" error={errorMessages.textError}>
            <Textarea
              disabled={updates.pending}
              name="text"
              useCacheForDOMMeasurements
              value={values.text}
              onChange={handleValueChanges}
              minRows={2}
            />
          </FormField>
          <Button
            primary
            disabled={updates.pending}
            onClick={onSubmit}
            label={<FormattedMessage {...messages.send} />}
          />
        </Box>
      )}
    </FormValidation>
  </div>
);

MessageForm.propTypes = {
  updates: PropTypes.shape({}).isRequired,
  onSend: PropTypes.func.isRequired,
};

export default withStyles(s)(MessageForm);
