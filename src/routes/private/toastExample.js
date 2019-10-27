// @flow

import React, { useState } from 'react';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

type Props = { bottom?: boolean, label: string };
function ToastExample({ bottom, label }: Props) {
  const [isVisible, setVisibility] = useState(false);
  return (
    <div>
      {isVisible && (
        <Toast bottom={bottom}>
          <span>I am a toast</span>
        </Toast>
      )}
      <Button onClick={() => setVisibility(!isVisible)}>{label}</Button>
    </div>
  );
}

ToastExample.defaultProps = {
  bottom: null,
};

export default ToastExample;
