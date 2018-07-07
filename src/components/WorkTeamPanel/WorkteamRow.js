import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '../TableRow';
import Image from '../Image';
import Button from '../Button';
import Box from '../Box';
import UserThumbnail from '../UserThumbnail';
import { ICONS } from '../../constants';

function WorkteamTableRow({
  displayName,
  logo,
  onClickMenu,
  coordinator,
  deletedAt,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow onClick={() => onClickMenu('SHOW')}>
      <td style={{ minWidth: '84px' }}>
        <Box wrap>
          {logo && <Image src={logo} thumb />}
          <span>{`${displayName}`}</span>
        </Box>
      </td>
      <td style={{ textAlign: 'left' }}>
        {coordinator ? <UserThumbnail user={coordinator} /> : 'No coordinator'}
      </td>
      <td>
        <Button
          onClick={e => {
            onClickMenu('VISIBILITY');
            e.preventDefault();
            e.stopPropagation();
          }}
          plain
          icon={
            <svg
              version="1.1"
              fill="#0000008a"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="edit"
              xmlns="https://www.w3.org/2000/svg"
            >
              <path d={ICONS[deletedAt ? 'visibilityOff' : 'visibility']} />
            </svg>
          }
        />
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
              aria-label="edit"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d={ICONS.delete}
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
              aria-label="edit"
            >
              <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.edit} />
            </svg>
          }
          onClick={e => {
            onClickMenu('EDIT');
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </td>
    </TableRow>
  );
}

WorkteamTableRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  displayName: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  coordinator: PropTypes.shape({}).isRequired,
  deletedAt: PropTypes.string.isRequired,
};

WorkteamTableRow.defaultProps = {};

export default WorkteamTableRow;
