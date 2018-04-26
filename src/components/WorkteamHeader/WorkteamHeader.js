import React from 'react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import { ICONS } from '../../constants';
import history from '../../history';

const WorkteamHeader = ({ displayName, logo, id }) => (
  // eslint-disable-next-line
  <div
    style={{ cursor: 'pointer', alignSelf: 'left' }}
    onClick={() => history.push(`/workteams/${id}`)}
  >
    <Heading tag="h3">
      {logo ? (
        'IMPLEMENT LOGO'
      ) : (
        <svg
          version="1.1"
          viewBox="0 0 24 24"
          role="img"
          width="48px"
          height="48px"
          aria-label="cloud"
        >
          <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.workteam} />
        </svg>
      )}
      {displayName}
    </Heading>
  </div>
);

WorkteamHeader.propTypes = {
  displayName: PropTypes.string.isRequired,
  logo: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
WorkteamHeader.defaultProps = {
  logo: null,
};

export default WorkteamHeader;
