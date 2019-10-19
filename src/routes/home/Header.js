/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import s from './Header.css';
import Label from '../../components/Label';

type Props = {
  small: boolean,
  data: { title: string, actions: Array<string> },
};

const Header = ({ small, data }: Props) => {
  return (
    <div className={cn(s.header, small && s.small)}>
      <h1>{data.title}</h1>
      {!small && (
        <div className={s.description}>
          <ul>
            {data.actions.map(text => (
              <li>
                <svg
                  style={{
                    stroke: '#fff',
                    strokeWidth: '2px',
                    width: '1.5em',
                  }}
                  viewBox="0 0 24 24"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path fill="none" d="M6,11.3 L10.3,16 L18,6.2" />
                </svg>
                <Label>{text}</Label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default withStyles(s)(Header);
