import React from 'react';
import PropTypes from 'prop-types';

const KeyValueRow = ({ name, value }) => (
  <tr>
    <th>
      <span>{name}</span>:
    </th>
    <td>{value}</td>
  </tr>
);

KeyValueRow.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

export default KeyValueRow;
