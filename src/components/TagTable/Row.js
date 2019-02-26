import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
/* eslint-disable css-modules/no-unused-class */
import s from './TagTable.css';
import TableRow from '../TableRow';
import Button from '../Button';

function RequestTableRow({
  text,
  deName,
  count,
  itName,
  lldName,
  onClickMenu,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow className={s.row} onClick={() => onClickMenu('EDIT')}>
      <td>
        <span>{text}</span>
      </td>
      <td>
        <span>{deName}</span>
      </td>
      <td>
        <span>{itName}</span>
      </td>
      <td>
        <span>{lldName}</span>
      </td>
      <td>
        <span>{count}</span>
      </td>
      <td>
        <Button
          plain
          icon={
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="trash"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d="M4,5 L20,5 L20,23 L4,23 L4,5 Z M1,5 L23,5 M9,1 L15,1 L15,5 L9,5 L9,1 Z M9,1 L15,1 L15,5 L9,5 L9,1 Z M15,9 L15,19 M9,9 L9,19"
              />
            </svg>
          }
          onClick={e => {
            onClickMenu('DELETE');
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </td>
    </TableRow>
  );
}

RequestTableRow.propTypes = {
  text: PropTypes.string,
  deName: PropTypes.string,
  itName: PropTypes.string,
  lldName: PropTypes.string,
  count: PropTypes.number,
  onClickMenu: PropTypes.func.isRequired,
};

RequestTableRow.defaultProps = {
  text: null,
  deName: null,
  itName: null,
  lldName: null,
  count: null,
};

export default withStyles(s)(RequestTableRow);
