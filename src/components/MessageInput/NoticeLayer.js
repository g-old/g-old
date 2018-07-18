import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Layer from '../Layer';
import Box from '../Box';
import Button from '../Button';
import Message from '../Message';
import Label from '../Label';

const messages = defineMessages({
  submit: {
    id: 'command.submit',
    description: 'Short command for sending data to the server',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'commands.cancel',
    description: 'Short command to cancel a operation',
    defaultMessage: 'Cancel',
  },
});
const getContent = textHtml => {
  const res = {};
  if (textHtml) {
    res.de = textHtml.de || Object.values(textHtml).find(s => s);

    res.it = textHtml.it || Object.values(textHtml).find(s => s);
  }
  return res;
};

const NoticeLayer = ({ message, onSend, onClose, updates }) => {
  const content = (
    <Box column align>
      <Label> DEUTSCH </Label>
      <Message
        subject={getContent(message.subject).de}
        content={getContent(message.note.textHtml).de}
      />
      <Label> ITALIANO </Label>
      <Message
        subject={getContent(message.subject).it}
        content={getContent(message.note.textHtml).it}
      />
    </Box>
  );
  const dialog = (
    <Box column>
      <Button
        primary
        disabled={updates.pending}
        onClick={() => onSend()}
        label={<FormattedMessage {...messages.submit} />}
      />
      <Button
        onClick={onClose}
        label={<FormattedMessage {...messages.cancel} />}
      />
    </Box>
  );

  return (
    <Layer onClose={onClose}>
      {content}
      <Box justify padding="medium">
        {dialog}
      </Box>
    </Layer>
  );
};

NoticeLayer.propTypes = {
  message: PropTypes.shape({}).isRequired,
  updates: PropTypes.shape({ pending: PropTypes.bool }).isRequired,

  onSend: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NoticeLayer;
