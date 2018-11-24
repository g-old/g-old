import React from 'react';
import PropTypes from 'prop-types';
import Box from '../../components/Box';
import { ICONS } from '../../constants';

const WorkteamItem = ({ workteam, onClick }) => (
  <Box pad onClick={() => onClick(workteam.id)} align>
    <svg
      version="1.1"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      role="img"
      aria-label="organization"
    >
      <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.workteam} />
    </svg>
    <span>{workteam.displayName}</span>
  </Box>
);

WorkteamItem.propTypes = {
  workteam: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default WorkteamItem;
