import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import { ICONS } from '../../constants';

const Filter = ({ filterFn, filter }) => {
  const active = filter !== 'all';
  return (
    <span>
      <Button
        onClick={e => filterFn(e, { filter: 'all' })}
        plain
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <polygon
              fill={active ? '#eee7f5' : 'none'}
              opacity={active ? 1 : 0.2}
              stroke="#000"
              strokeWidth="2"
              points="3 6 10 13 10 21 14 21 14 13 21 6 21 3 3 3"
            />
          </svg>
        }
      />
      <Button
        onClick={e => filterFn(e, { filter: 'pro' })}
        plain
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <path
              fill="none"
              stroke={filter === 'pro' ? '#8cc800' : '#000'}
              strokeWidth="2"
              d={ICONS.up}
            />
          </svg>
        }
      />
      <Button
        onClick={e => filterFn(e, { filter: 'con' })}
        plain
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
            <path
              fill="none"
              stroke={filter === 'con' ? '#ff324d' : '#000'}
              strokeWidth="2"
              d={ICONS.up}
              transform="matrix(1 0 0 -1 0 24)"
            />
          </svg>
        }
      />

    </span>
  );
};

Filter.propTypes = {
  filterFn: PropTypes.func.isRequired,
  filter: PropTypes.oneOf(['all', 'con', 'pro']).isRequired,
};

export default Filter;
