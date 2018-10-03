import React from 'react';
import PropTypes from 'prop-types';
import Box from '../Box';
import Proposal from '../Proposal';
import Navigation from './Navigation';

const validate = (name, data) => {
  let validated = data && data.trim();
  if (!validated) {
    validated = `${name} is missing!`;
  } else if (validated.length < 3) {
    validated = `${name} is too short!`;
  }
  return validated;
};

const InputPreview = ({ state, title, body, spokesman, onSubmit }) => (
  <Box column>
    <Proposal
      id="0000"
      state={state}
      publishedAt={new Date()}
      title={validate('Title', title)}
      body={validate('Body', body)}
      spokesman={spokesman}
    />
    <Navigation onNext={onSubmit} />
  </Box>
);

InputPreview.propTypes = {
  state: PropTypes.oneOf(['proposed', 'survey']).isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  spokesman: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
};
export default InputPreview;
