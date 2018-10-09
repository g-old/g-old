/* @flow */
import React from 'react';
import type { Node } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './StepPage.css';
import Box from '../Box';

type Props = {
  children: Node,
};

const StepPage = ({ children }: Props) => (
  <Box className={s.root} pad column>
    {children}
  </Box>
);

export default withStyles(s)(StepPage);
