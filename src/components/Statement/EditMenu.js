import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../constants';
import Button from '../Button';

const EditMenu = ({
  isInput,
  onTextSubmit,
  onEndEditing,
  onEdit,
  onDelete,
  isEditing,
  disabled,
  enableSubmit,
}) => {
  if (disabled) {
    return null;
  }
  let content;
  if (isEditing) {
    content = (
      <span>
        <Button
          plain
          onClick={onTextSubmit}
          disabled={!enableSubmit}
          icon={
            <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
              <polyline
                fill="none"
                stroke="#000"
                strokeWidth="2"
                points={ICONS.check}
              />
            </svg>
          }
        />

        <Button
          plain
          onClick={onEndEditing}
          disabled={isInput && !enableSubmit}
          icon={
            <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d={ICONS.delete}
              />
            </svg>
          }
        />
      </span>
    );
  } else {
    content = (
      <span>
        <Button
          plain
          onClick={onEdit}
          icon={
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
            >
              <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.edit} />
            </svg>
          }
        />
        {!isEditing && (
          <Button
            plain
            onClick={onDelete}
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS.trash}
                />
              </svg>
            }
          />
        )}
      </span>
    );
  }
  return (
    <div>
      <span style={{ marginRight: '0.5em' }}>{content}</span>
    </div>
  );
};
EditMenu.propTypes = {
  isInput: PropTypes.bool,
  isEditing: PropTypes.bool,
  enableSubmit: PropTypes.bool,
  disabled: PropTypes.bool,
  onTextSubmit: PropTypes.func.isRequired,
  onEndEditing: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
EditMenu.defaultProps = {
  isInput: null,
  isEditing: null,
  enableSubmit: null,
  disabled: null,
};

export default EditMenu;
