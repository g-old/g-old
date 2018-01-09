import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
/* eslint-disable css-modules/no-unused-class */
import s from './WorkTeamsList.css';
import TableRow from '../TableRow';
import Image from '../Image';
import Button from '../Button';
import Box from '../Box';
import Avatar from '../Avatar';

function WorkTeamTableRow({
  displayName,
  numMembers,
  numDiscussions,
  logo,
  onClickMenu,
  coordinator,
  restricted,
}) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <TableRow className={s.row} onClick={() => onClickMenu('SHOW')}>
      <td style={{ minWidth: '84px' }}>
        <Box pad wrap>
          {logo && <Image src={logo} thumb />}
          <span>{`${displayName}`}</span>
        </Box>
      </td>
      <td>
        {coordinator ? (
          <Box align>
            <Avatar user={coordinator} />
            <span>{`${coordinator.name[0]}. ${coordinator.surname}`}</span>
          </Box>
        ) : (
          'No coordinator'
        )}
      </td>
      <td>{restricted ? 'true' : 'false'}</td>
      <td>
        <span>{numMembers}</span>
      </td>
      <td>
        <span>{numDiscussions}</span>
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
                d="M14,4 L20,10 L14,4 Z M22.2942268,5.29422684 C22.6840146,5.68401459 22.6812861,6.3187139 22.2864907,6.71350932 L9,20 L2,22 L4,15 L17.2864907,1.71350932 C17.680551,1.319449 18.3127724,1.31277239 18.7057732,1.70577316 L22.2942268,5.29422684 Z M3,19 L5,21 M7,17 L15,9"
              />
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

WorkTeamTableRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  displayName: PropTypes.string.isRequired,
  numMembers: PropTypes.number.isRequired,
  numDiscussions: PropTypes.number.isRequired,
  logo: PropTypes.string.isRequired,
  coordinator: PropTypes.shape({}).isRequired,
  restricted: PropTypes.bool.isRequired,
};

WorkTeamTableRow.defaultProps = {
  checked: null,
};

export default withStyles(s)(WorkTeamTableRow);
