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

function ConfirmLayer(props) {
  const action = props.action || 'delete';
  let note;
  if (props.note) {
    note = (
      <Box pad="medium">
        <Box align="center" justify="center">
          {props.note}
        </Box>
      </Box>
    );
  }
  return (
    <Layer onClose={props.onClose}>
      <Form>
        <Header pad="medium" direction="column">
          <Heading tag="h2" margin="none">
            {props.title || <FormattedMessage {...messages.confirm} />}
          </Heading>
        </Header>
        {note}
        <Box tag="footer" justify padding="medium">
          <div>
            <Button
              label={props.intl.formatMessage({ ...messages[action] })}
              onClick={props.onSubmit}
            />{' '}
            <Button
              label={props.intl.formatMessage({ ...messages.cancel })}
              primary
              onClick={props.onClose}
            />
          </div>
        </Box>
      </Form>
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
};

ConfirmLayer.defaultProps = {
  note: null,
};
