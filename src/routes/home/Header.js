/* @flow */
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Header.css';
import Label from '../../components/Label';

const messages = defineMessages({
  title: {
    id: 'header.title',
    defaultMessage: 'Direct Democracy',
    description: 'Main title of the start page',
  },
  addProposal: {
    id: 'header.addProposal',
    defaultMessage: 'add a proposal',
    description: 'Functionality preview - adding a proposal',
  },
  voteProposal: {
    id: 'header.voteProposal',
    defaultMessage: 'vote proposals',
    description: 'Functionality preview - voting on proposals',
  },
  prepareProposal: {
    id: 'header.prepareProposal',
    defaultMessage: 'prepare a legislative proposal with others',
    description: 'Functionality preview - preparation',
  },
  initRef: {
    id: 'header.initRef',
    defaultMessage: 'initiate a referendum',
    description: 'Functionality preview -referendum',
  },
});
type Props = { small: boolean };

const Header = ({ small }: Props) => {
  const actions = [
    <FormattedMessage {...messages.addProposal} />,
    <FormattedMessage {...messages.voteProposal} />,
    <FormattedMessage {...messages.prepareProposal} />,
    <FormattedMessage {...messages.initRef} />,
  ];
  return (
    <div className={s.header}>
      <h1>
        <FormattedMessage {...messages.title} />
      </h1>
      {!small && (
        <div className={s.description}>
          <ul>
            {actions.map(text => (
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
