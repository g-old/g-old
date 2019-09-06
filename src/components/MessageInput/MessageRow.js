import React from 'react';
import PropTypes from 'prop-types';
// import { FormattedRelative } from 'react-intl';
import TableRow from '../TableRow';

function MessageRow({ messageType, messageObject, onClickMenu }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  if (!messageObject) return null;

  return (
    <TableRow onClick={() => onClickMenu(messageObject)}>
      <td>
        <div dangerouslySetInnerHTML={{ __html: messageObject.content }} />
      </td>
      <td> {messageType}</td>
      <td>{messageObject.keyword}</td>
      <td>{messageObject.category}</td>
      <td>{messageObject.isPublished ? 'yes' : 'no'}</td>
    </TableRow>
  );
}

MessageRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  messageObject: PropTypes.shape({
    content: PropTypes.string,
    keyword: PropTypes.string,
    category: PropTypes.string,
    isPublished: PropTypes.bool,
  }).isRequired,
  messageType: PropTypes.string.isRequired,
};

export default MessageRow;
