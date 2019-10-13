import React from 'react';
import PropTypes from 'prop-types';
import {
  defineMessages,
  FormattedMessage,
  intlShape,
  injectIntl,
} from 'react-intl';
import Layer from '../Layer';
import Box from '../Box';
import Form from '../Form';
import Header from '../Header2';
import Heading from '../Heading';
import Button from '../Button';

const messages = defineMessages({
  delete: {
    id: 'commands.delete',
    defaultMessage: 'Delete',
    description: 'Short command to invoke deletion',
  },
  leave: {
    id: 'action.leave',
    defaultMessage: 'Leave',
    description: 'Label',
  },
  change: {
    id: 'commands.change',
    description: 'Short command to change a setting',
    defaultMessage: 'Change',
  },
  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },
  confirm: {
    id: 'header.confirmation',
    defaultMessage: 'Please confirm',
    description: 'Confirmation components header',
  },
});

function ConfirmLayer({
  action,
  note,
  onClose,
  title,
  intl,
  onSubmit,
  children,
  pending,
}) {
  const actionId = action || 'delete';
  let message;
  if (note) {
    message = (
      <Box pad="medium">
        <Box align="center" justify="center">
          {note}
        </Box>
      </Box>
    );
  }
  return (
    <Layer onClose={onClose}>
      <Box justify>
        <Form>
          <Header pad="medium" direction="column">
            <Heading tag="h2" margin="none">
              {title || <FormattedMessage {...messages.confirm} />}
            </Heading>
          </Header>
          {message}
          {children}
          <Box tag="footer" justify padding="medium">
            <Button
              label={intl.formatMessage({
                ...messages[actionId],
              })}
              onClick={onSubmit}
              disabled={pending}
            />{' '}
            <Button
              label={intl.formatMessage({
                ...messages.cancel,
              })}
              primary
              disabled={pending}
              onClick={onClose}
            />
          </Box>
        </Form>
      </Box>
    </Layer>
  );
}

export default injectIntl(ConfirmLayer);

ConfirmLayer.propTypes = {
  action: PropTypes.oneOf(['delete', 'leave']).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  note: PropTypes.string,
  title: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  children: PropTypes.node,
  pending: PropTypes.bool,
};

ConfirmLayer.defaultProps = {
  note: null,
  children: null,
  pending: false,
};
