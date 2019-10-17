/* @flow */
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import Heading from '../Heading';
import ListView from '../ListView';
import UserListItem from './UserListItem';

// eslint-disable-next-line no-bitwise
const messages = defineMessages({
  users: {
    id: 'users',
    defaultMessage: 'Users',
    description: 'Users label',
  },
});

type Fn = () => void;

type Props = {
  userCount?: number,
  onRetry: Fn,
  onLoadMore: Fn,
  pageInfo: mixed,
  users: UserShape[],
  onUserClick: ID => void,
  label?: string,
};

export default function AccountsView({
  userCount,
  onRetry,
  onLoadMore,
  pageInfo,
  users,
  onUserClick,
  label,
}: Props) {
  return (
    <Box pad column>
      <Heading tag="h3">
        <div style={{ paddingLeft: '0.5em' }}>
          <FormattedMessage {...messages.users} /> {label} ({userCount})
        </div>
      </Heading>
      <ListView
        boxed
        onRetry={onRetry}
        onLoadMore={onLoadMore}
        pageInfo={pageInfo}
      >
        {users.map(u => u && <UserListItem user={u} onClick={onUserClick} />)}
      </ListView>
    </Box>
  );
}

AccountsView.defaultProps = {
  userCount: null,
  label: null,
};
