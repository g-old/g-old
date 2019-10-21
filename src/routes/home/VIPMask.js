/* @flow */
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import Login from '../../components/Login';
import s from './VIPMask.css';
import Button from '../../components/Button';
import history from '../../history';
import Box from '../../components/Box';

const messages = defineMessages({
  signup: {
    id: 'label.signup',
    defaultMessage: 'Sign Up',
    description: 'Label signup',
  },
  or: {
    id: 'label.or',
    defaultMessage: 'OR',
    description: 'Label or',
  },
});
type Props = { small: boolean, onRef: () => void };
const VIPMask = ({ small, onRef }: Props) => (
  <Box className={cn(s.root, small && s.small)} column>
    <div ref={onRef} className={s.formGroup}>
      <Button
        fill
        className={s.signup}
        label={<FormattedMessage {...messages.signup} />}
        onClick={() => {
          history.push('/signup');
        }}
      />
    </div>
    <span className={s.or}>
      <FormattedMessage {...messages.or} />
    </span>

    {/* <strong className={s.lineThrough}>
                <FormattedMessage {...messages.or} />
              {/*</strong> */}

    <Login />
  </Box>
);
export default withStyles(s)(VIPMask);
