import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserPanel.css';
import { notifyUser } from '../../actions/notifications';
import { updateUser, loadUserList, findUser } from '../../actions/user';
import FetchError from '../FetchError';
import AccountDetails from '../AccountDetails';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import SearchField from '../../components/SearchField';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import Layer from '../Layer';
import UserListEntry from './UserListEntry';
import { Groups } from '../../organization';

// import history from '../../history';

import {
  getVisibleUsers,
  getUsersStatus,
  getSessionUser,
} from '../../reducers';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});

// eslint-disable-next-line no-bitwise
const VIEWERS = Groups.VIEWER | Groups.GUEST;

class UserPanel extends React.Component {
  static propTypes = {
    guestArray: PropTypes.arrayOf(PropTypes.object),
    viewerArray: PropTypes.arrayOf(PropTypes.object),
    loadUserList: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    guestArrayStatus: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
    viewerArrayStatus: PropTypes.shape({ pending: PropTypes.bool }).isRequired,

    findUser: PropTypes.func.isRequired,
    userArray: PropTypes.arrayOf(PropTypes.object).isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      permissions: PropTypes.number,
    }).isRequired,
    notifyUser: PropTypes.func.isRequired,
  };

  static defaultProps = {
    guestArray: null,
    viewerArray: null,
  };
  constructor(props) {
    super(props);
    this.state = { showAccount: false };
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.handleLayerClosing = this.handleLayerClosing.bind(this);
  }
  componentDidMount() {
    // this.props.loadUserList('viewer');
  }

  handleProfileClick({ id }) {
    this.setState({ showAccount: true, accountId: id });
    // history.push(`/admin/accounts/${id}`);
  }
  handleLayerClosing() {
    this.setState({ showAccount: false });
  }

  renderUserList(users) {
    return (
      <table className={s.userList}>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Created at</th>
            <th>Last login</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map(u => (
              <UserListEntry
                key={u.id}
                user={u}
                onProfileClick={this.handleProfileClick}
              />
            ))}
        </tbody>
      </table>
    );
  }

  render() {
    const {
      guestArrayStatus,
      viewerArrayStatus,
      viewerArray,
      guestArray,
    } = this.props;
    if (!this.props.user) return null;
    return (
      <Box wrap>
        <div style={{ marginLeft: '12px' }}>
          <FormField overflow label="Username">
            <SearchField
              data={this.props.userArray}
              fetch={this.props.findUser}
              displaySelected={data => {
                this.setState({ accountId: data.id, showAccount: true });
              }}
            />
          </FormField>
        </div>
        {this.state.showAccount && (
          <Layer onClose={this.handleLayerClosing}>
            <AccountDetails
              user={this.props.user}
              accountId={this.state.accountId}
              update={this.props.updateUser}
            />
          </Layer>
        )}
        <div style={{ width: '100%' }}>
          <Accordion openMulti>
            <AccordionPanel
              heading="Guest accounts"
              onActive={() => {
                this.props.loadUserList({ group: Groups.GUEST });
              }}
            >
              {guestArrayStatus.pending &&
                !guestArray.length && <p>Loading...</p>}
              {!guestArrayStatus.pending &&
                !guestArray.length &&
                !guestArrayStatus.error && <p> No data</p>}
              {guestArrayStatus.error && (
                <FetchError
                  message={guestArrayStatus.error}
                  onRetry={() =>
                    this.props.loadUserList({ group: Groups.GUEST })
                  }
                />
              )}
              {this.renderUserList(this.props.guestArray)}
              {guestArrayStatus.pageInfo.hasNextPage && (
                <Button
                  primary
                  disabled={guestArrayStatus.pending}
                  onClick={() => {
                    this.props.loadUserList({
                      group: Groups.GUEST,
                      after: guestArrayStatus.pageInfo.endCursor,
                    });
                  }}
                  label={<FormattedMessage {...messages.loadMore} />}
                />
              )}
            </AccordionPanel>
            <AccordionPanel
              heading="Viewer accounts"
              onActive={() => {
                this.props.loadUserList({ group: VIEWERS });
              }}
            >
              {viewerArrayStatus.pending &&
                !viewerArray.length && <p>Loading...</p>}
              {!viewerArrayStatus.pending &&
                !viewerArray.length &&
                !viewerArrayStatus.error && <p> No data</p>}
              {viewerArrayStatus.error && (
                <FetchError
                  message={viewerArrayStatus.error}
                  onRetry={() =>
                    this.props.loadUserList({
                      group: VIEWERS,
                    })
                  }
                />
              )}
              {this.renderUserList(this.props.viewerArray)}
              {viewerArrayStatus.pageInfo.hasNextPage && (
                <Button
                  primary
                  disabled={viewerArrayStatus.pending}
                  onClick={() => {
                    this.props.loadUserList({
                      group: VIEWERS,
                      after: viewerArrayStatus.pageInfo.endCursor,
                    });
                  }}
                  label={<FormattedMessage {...messages.loadMore} />}
                />
              )}
            </AccordionPanel>
          </Accordion>
        </div>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  guestArray: getVisibleUsers(state, Groups.GUEST),
  viewerArray: getVisibleUsers(state, VIEWERS),
  guestArrayStatus: getUsersStatus(state, Groups.GUEST),
  viewerArrayStatus: getUsersStatus(state, VIEWERS),
  userArray: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
});

const mapDispatch = {
  updateUser,
  loadUserList,
  findUser,
  notifyUser,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserPanel));
