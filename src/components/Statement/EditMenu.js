import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  submit: {
    id: 'command.submit',
    description: 'Short command for sending data to the server',
    defaultMessage: 'Submit',
  },
  edit: {
    id: 'commands.edit',
    description: 'Edit',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'statements.delete',
    defaultMessage: 'delete',
    description: 'Menu entry on statements to delete statement',
  },
  cancel: {
    id: 'commands.cancel',
    description: 'Short command to cancel a operation',
    defaultMessage: 'Cancel',
  },
  collapse: {
    id: 'statements.collapse',
    defaultMessage: 'Show less',
    description: 'Btn to collapse statements',
  },
});

const EditMenu = ({
  onTextSubmit,
  onEndEditing,
  onEdit,
  onDelete,
  isEditing,
  disabled,
  enableSubmit,
}) => {
  if (disabled) {
    return null;
  }
  let content;
  if (isEditing) {
    content = [
      <button type="button" onClick={onTextSubmit} disabled={!enableSubmit}>
        <FormattedMessage {...messages.submit} />
      </button>,
      <button type="button" onClick={onEndEditing}>
        <FormattedMessage {...messages.cancel} />
      </button>,
    ];
  } else {
    content = [
      <button type="button" onClick={onEdit} disabled={!enableSubmit}>
        <FormattedMessage {...messages.edit} />
      </button>,
    ];

    if (!isEditing) {
      content.push(
        <button type="button" onClick={onDelete}>
          <FormattedMessage {...messages.delete} />
        </button>,
      );
    }
  }
  return content;
};
EditMenu.propTypes = {
  isEditing: PropTypes.bool,
  enableSubmit: PropTypes.bool,
  disabled: PropTypes.bool,
  onTextSubmit: PropTypes.func.isRequired,
  onEndEditing: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
EditMenu.defaultProps = {
  isEditing: null,
  enableSubmit: null,
  disabled: null,
};

export default EditMenu;
