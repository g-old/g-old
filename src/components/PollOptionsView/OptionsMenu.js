/* @flow */

import React from 'react';
import Button from '../Button';
import Box from '../Box';

type Func = () => void;
type Props = {
  onSort: Func,
  onCollapse: Func,
  onChangeOrder: Func,
  isCollapsed: boolean,
  isSorted: boolean,
};

const OptionsMenu = ({
  onSort,
  isSorted,
  onCollapse,
  isCollapsed,
  onChangeOrder,
}: Props) => (
  <Box>
    <Button
      plain
      onClick={onSort}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill={isSorted ? '#f00' : '#000'}
            d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"
          />
        </svg>
      }
    />
    <Button
      plain
      onClick={onCollapse}
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="#000000"
            d={
              isCollapsed
                ? 'M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z'
                : 'M16.59,5.41L15.17,4L12,7.17L8.83,4L7.41,5.41L12,10M7.41,18.59L8.83,20L12,16.83L15.17,20L16.58,18.59L12,14L7.41,18.59Z'
            }
          />
        </svg>
      }
    />
    <Button
      plain
      onClick={onChangeOrder}
      icon={
        <svg width="24px" height="24px" viewBox="0 0 24 24">
          <path
            fill="#000000"
            d="M4,17V9H2V7H6V17H4M22,15C22,16.11 21.1,17 20,17H16V15H20V13H18V11H20V9H16V7H20A2,2 0 0,1 22,9V10.5A1.5,1.5 0 0,1 20.5,12A1.5,1.5 0 0,1 22,13.5V15M14,15V17H8V13C8,11.89 8.9,11 10,11H12V9H8V7H12A2,2 0 0,1 14,9V11C14,12.11 13.1,13 12,13H10V15H14Z"
          />
        </svg>
      }
    />
  </Box>
);

export default OptionsMenu;
