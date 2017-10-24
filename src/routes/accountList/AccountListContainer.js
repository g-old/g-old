import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadUserList } from '../../actions/user';
import { Groups } from '../../organization';
import { getVisibleUsers, getUsersStatus } from '../../reducers';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Headline from '../../components/Headline';
import FetchError from '../../components/FetchError';

import history from '../../history';

// eslint-disable-next-line no-bitwise
const ACTIVE_USER = Groups.VIEWER | Groups.VOTER;
const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});
const handleItemClick = id => {
  history.push(`/accounts/${id}`);
};
// TODO don't user List component - onClick is not cheap
class AccountList extends React.Component {
  static propTypes = {
    loadUserList: PropTypes.func.isRequired,
    userList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    userListStatus: PropTypes.shape({}).isRequired,
  };
  render() {
    const { userListStatus, userList } = this.props;
    return (
      <div>
        <Headline>{'MEMBERS'}</Headline>
        {userListStatus.pending && !userList.length && <p>Loading...</p>}
        {!userListStatus.pending &&
          !userList.length &&
          !userListStatus.error && <p> No data</p>}
        {userListStatus.error && (
          <FetchError
            message={userListStatus.error}
            onRetry={() =>
              this.props.loadUserList({ group: ACTIVE_USER, union: true })}
          />
        )}
        <List>
          {userList.map(u => (
            <ListItem onClick={() => handleItemClick(u.id)}>
              <Avatar user={u} />
              <span>
                {u.name} {} {u.surname}
              </span>
            </ListItem>
          ))}
        </List>
        {userListStatus.pageInfo.hasNextPage && (
          <Button
            primary
            disabled={userListStatus.pending}
            onClick={() => {
              this.props.loadUserList({
                group: ACTIVE_USER,
                after: userListStatus.pageInfo.endCursor,
                union: true,
              });
            }}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userList: getVisibleUsers(state, 'all'),
  userListStatus: getUsersStatus(state, ACTIVE_USER),
});

const mapDispatch = {
  loadUserList,
};

export default connect(mapStateToProps, mapDispatch)(AccountList);
