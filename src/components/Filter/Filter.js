import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import Box from '../Box';

const Filter = ({ filterFn, filter }) => {
  const active = filter !== 'all';
  const states = ['all', 'pro', 'con'];
  return (
    <Box>
      <Button
        onClick={e =>
          filterFn(e, {
            filter: states[(states.indexOf(filter) + 1) % 3],
          })
        }
        accent={!active}
        primary={active}
        label={filter}
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <polygon
              fill="none"
              opacity={active ? 1 : 0.2}
              stroke="#000"
              strokeWidth="2"
              points="3 6 10 13 10 21 14 21 14 13 21 6 21 3 3 3"
            />
          </svg>
        }
      />
    </Box>
  );
};

Filter.propTypes = {
  filterFn: PropTypes.func.isRequired,
  filter: PropTypes.oneOf(['all', 'con', 'pro']).isRequired,
};

export default Filter;
