import React from 'react';
import PropTypes from 'prop-types';
// import { highlightContent, uuid } from '../../core/utils';
import GroupTableRow from './Row';

/* eslint-disable */
function uuid() {
  let i;
  let random;
  let id = '';
  for (i = 0; i < 32; i += 1) {
    random = (Math.random() * 16) | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      id += '-';
    }

    id += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }

  return id;
}

/* eslint-enable */

export default function GroupTableRows({
  groups,
  onClickCheckbox,
  onClickMenu,
  allowMultiSelect,
  children,
  checkedIndices,
}) {
  if (!groups.length && children) {
    return React.cloneElement(children);
  }
  return (
    <tbody style={{ minHeight: '500px' }}>
      {groups.map((group, index) => (
        <GroupTableRow
          checked={checkedIndices.indexOf(index) >= 0}
          key={uuid()}
          onClickCheckbox={checked => onClickCheckbox(index, checked)}
          onClickMenu={action => onClickMenu(action, group)}
          allowMultiSelect={allowMultiSelect}
          {...group}
        />
      ))}
    </tbody>
  );
}

GroupTableRows.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({})),
  onClickCheckbox: PropTypes.func.isRequired,
  onClickMenu: PropTypes.func.isRequired,
  allowMultiSelect: PropTypes.bool.isRequired,
  children: PropTypes.element,
  checkedIndices: PropTypes.arrayOf(PropTypes.number),
};

GroupTableRows.defaultProps = {
  groups: null,
  searchTerm: null,
  requiresSearch: null,

  children: null,
  checkedIndices: null,
};
