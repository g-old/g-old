import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import Box from '../Box';
import Button from '../Button';

const NoticeLayer = ({ isDraft, isPublished, isSending, onSend, onClose }) => {
  let dialog;
  if (isDraft && isPublished && !isSending) {
    dialog = (
      <Box column>
        <Button primary onClick={() => onSend(true)} label="Overwrite" />
        <Button onClick={() => onSend(false)} label="Save as new" />
        <Button onClick={onClose} label="Cancel" />
      </Box>
    );
  } else {
    dialog = <Box column>Something went wrong :(</Box>;
  }
  return (
    <Layer onClose={onClose}>
      <Box padding="medium"> {dialog}</Box>
    </Layer>
  );
};

NoticeLayer.propTypes = {
  isDraft: PropTypes.bool.isRequired,
  isPublished: PropTypes.bool.isRequired,
  isSending: PropTypes.bool.isRequired,
  onSend: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NoticeLayer;
