import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import Proposal from '../Proposal';

const validate = (name, data) => {
  let validated = data && data.trim();
  if (!validated) {
    validated = `${name} is missing!`;
  } else if (validated.length < 3) {
    validated = `${name} is too short!`;
  }
  return validated;
};

const PreviewLayer = ({ state, title, body, spokesman, onClose }) => (
  <Layer onClose={onClose}>
    <Proposal
      id="0000"
      state={state}
      publishedAt={new Date()}
      title={validate('Title', title)}
      body={validate('Body', body)}
      spokesman={spokesman}
    />
  </Layer>
);

PreviewLayer.propTypes = {
  state: PropTypes.oneOf(['proposed', 'survey']).isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  spokesman: PropTypes.shape({}).isRequired,
  onClose: PropTypes.func.isRequired,
};
export default PreviewLayer;
