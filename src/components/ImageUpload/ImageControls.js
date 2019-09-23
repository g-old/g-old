/* @flow */
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Button from '../Button';
import Label from '../Label';
import Box from '../Box';
import { ICONS } from '../../constants';

const messages = defineMessages({
  rotate: {
    id: 'commands.rotate',
    defaultMessage: 'Rotate',
    description: 'Short command for rotation',
  },
});
type Props = {
  disable: boolean,
  onScaleChanged: number => void,
  scale: number,
  onRotationChanged: number => void,
  rotation: number,
};
const ImageControls = ({
  disable,
  onScaleChanged,
  scale,
  onRotationChanged,
  rotation,
}: Props) => {
  return (
    <Box pad column justify>
      <Box pad justify align>
        <Label>Zoom:</Label>

        <Button
          plain
          disable={disable}
          onClick={() => {
            onScaleChanged(scale + 0.1);
          }}
          icon={
            <svg
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="add"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d="M12,22 L12,2 M2,12 L22,12"
              />
            </svg>
          }
        />

        <Button
          plain
          disable={disable}
          onClick={() => {
            onScaleChanged(Math.max(scale - 0.1, 1));
          }}
          icon={
            <svg
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="subtract"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d="M2,12 L22,12"
              />
            </svg>
          }
        />
      </Box>
      {onRotationChanged && (
        <Box justify>
          <Button
            disable={disable}
            plain
            label={<FormattedMessage {...messages.rotate} />}
            onClick={() => onRotationChanged((rotation - 90) % 360)}
          >
            <svg viewBox="0 0 24 24" width={24} height={24}>
              <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.retry} />
            </svg>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImageControls;
