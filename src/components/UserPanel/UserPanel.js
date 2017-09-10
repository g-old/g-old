import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserPanel.css';
import { notifyUser } from '../../actions/notifications';
import { updateUser, loadUserList, findUser } from '../../actions/user';
import { loadWorkTeams, createWorkTeam } from '../../actions/workTeam';
import FetchError from '../FetchError';
import AccountDetails from '../AccountDetails';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import SearchField from '../../components/SearchField';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import WorkTeamInput from '../WorkTeamInput';
import Layer from '../Layer';
import NotificationInput from '../NotificationInput';
import UserListEntry from './UserListEntry';
// import history from '../../history';

import {
  getVisibleUsers,
  getUsersIsFetching,
  getUsersErrorMessage,
  getSessionUser,
  getWorkTeams,
} from '../../reducers';

class UserPanel extends React.Component {
  static propTypes = {
    guestArray: PropTypes.arrayOf(PropTypes.object),
    viewerArray: PropTypes.arrayOf(PropTypes.object),
    loadUserList: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    guestArrayIsFetching: PropTypes.bool,
    guestArrayErrorMessage: PropTypes.string,
    viewerArrayIsFetching: PropTypes.bool,
    viewerArrayErrorMessage: PropTypes.string,
    findUser: PropTypes.func.isRequired,
    userArray: PropTypes.arrayOf(PropTypes.object).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      role: PropTypes.shape({ type: PropTypes.string }),
    }).isRequired,
    createWorkTeam: PropTypes.func.isRequired,
    loadWorkTeams: PropTypes.func.isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})),
    notifyUser: PropTypes.func.isRequired,
  };

  static defaultProps = {
    guestArray: null,
    viewerArray: null,
    guestArrayIsFetching: null,
    viewerArrayIsFetching: null,
    viewerArrayErrorMessage: null,
    guestArrayErrorMessage: null,
    workTeams: null,
  };
  constructor(props) {
    super(props);
    this.state = { selectedAccount: null, showAccount: false };
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
            <th>
              {'Avatar'}
            </th>
            <th>
              {'Name'}
            </th>
            <th>
              {'Created at'}
            </th>
            <th>
              {'Last login'}
            </th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map(u =>
              <UserListEntry
                key={u.id}
                user={u}
                onProfileClick={this.handleProfileClick}
              />,
            )}
        </tbody>
      </table>
    );
  }

  renderWorkTeams(teams) {
    return (
      <table className={s.workTeams}>
        <thead>
          <tr>
            <th className={s.team}>
              {'Name'}
            </th>
            <th className={s.members}>
              {'Members'}
            </th>
            <th className={s.coordinator}>
              {'Coordinator'}
            </th>
          </tr>
        </thead>
        <tbody>
          {teams &&
            teams.map(t =>
              <tr>
                <td className={s.team}>
                  {t.name}
                </td>
                <td className={s.members}>
                  {t.members &&
                    t.members.map(m =>
                      <img
                        style={{ height: '1em', width: '1em' }}
                        alt="member"
                        src={m.avatar}
                      />,
                    )}
                </td>
                <td className={s.coordinator}>
                  {t.coordinator &&
                    <span>
                      {`${t.coordinator.name} ${t.coordinator.surname}`}
                      <img
                        style={{ height: '1em', width: '1em' }}
                        alt="coordinator"
                        src={t.coordinator.avatar}
                      />
                      {// eslint-disable-next-line eqeqeq
                      (this.props.user.id == t.coordinator.id ||
                        this.props.user.role.type === 'admin') &&
                        <Button
                          plain
                          icon={
                            <svg
                              version="1.1"
                              viewBox="0 0 24 24"
                              width="24px"
                              height="24px"
                              role="img"
                              aria-label="mail"
                            >
                              <path
                                fill="none"
                                stroke="#000"
                                strokeWidth="2"
                                d="M1,5 L12,14 L23,5 M1,20 L23,20 L23,4 L1,4 L1,20 L1,20 Z"
                              />
                            </svg>
                          }
                          onClick={() => this.setState({ showNotify: t.id })}
                        />}
                    </span>}
                </td>
              </tr>,
            )}
        </tbody>
      </table>
    );
  }
  render() {
    const {
      guestArrayIsFetching,
      guestArrayErrorMessage,
      viewerArrayIsFetching,
      viewerArrayErrorMessage,
      viewerArray,
      guestArray,
      workTeams,
    } = this.props;
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
        {this.state.showAccount &&
          <Layer onClose={this.handleLayerClosing}>
            <AccountDetails
              user={this.props.user}
              accountId={this.state.accountId}
              update={this.props.updateUser}
            />
          </Layer>}
        <div style={{ width: '100%' }}>
          <Accordion openMulti>
            <AccordionPanel
              heading="Guest accounts"
              onActive={() => {
                this.props.loadUserList('guest');
              }}
            >
              {guestArrayIsFetching && !guestArray.length && <p>Loading...</p>}
              {!guestArrayIsFetching &&
                !guestArray.length &&
                !guestArrayErrorMessage &&
                <p> No data</p>}
              {guestArrayErrorMessage &&
                <FetchError
                  message={guestArrayErrorMessage}
                  onRetry={() => this.props.loadUserList('guest')}
                />}
              {this.renderUserList(this.props.guestArray)}
            </AccordionPanel>
            <AccordionPanel
              heading="Viewer accounts"
              onActive={() => {
                this.props.loadUserList('viewer');
              }}
            >
              {viewerArrayIsFetching &&
                !viewerArray.length &&
                <p>Loading...</p>}
              {!viewerArrayIsFetching &&
                !viewerArray.length &&
                !viewerArrayErrorMessage &&
                <p> No data</p>}
              {viewerArrayErrorMessage &&
                <FetchError
                  message={viewerArrayErrorMessage}
                  onRetry={() => this.props.loadUserList('viewer')}
                />}
              {this.renderUserList(this.props.viewerArray)}
            </AccordionPanel>
            <AccordionPanel
              heading="Workteams"
              onActive={() => this.props.loadWorkTeams(true)}
            >
              {this.renderWorkTeams(workTeams)}

              <Button
                primary
                disabled={this.props.user.role.type !== 'admin'}
                label={'ADD Workteam'}
                onClick={() => this.setState({ showCreateWG: true })}
              />
              {this.state.showNotify &&
                <Layer onClose={() => this.setState({ showNotify: false })}>
                  <NotificationInput
                    notifyGroup
                    updates={{}}
                    notifyUser={this.props.notifyUser}
                    types={['notification']}
                    receiverId={this.state.showNotify}
                  />
                </Layer>}

              {this.state.showCreateWG &&
                <WorkTeamInput
                  createWorkTeam={this.props.createWorkTeam}
                  findUser={this.props.findUser}
                  users={this.props.userArray}
                  onClose={() => this.setState({ showCreateWG: false })}
                />}
            </AccordionPanel>
          </Accordion>
        </div>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  guestArray: getVisibleUsers(state, 'guest'),
  viewerArray: getVisibleUsers(state, 'viewer'),
  guestArrayIsFetching: getUsersIsFetching(state, 'guest'),
  viewerArrayIsFetching: getUsersIsFetching(state, 'viewer'),
  guestArrayErrorMessage: getUsersErrorMessage(state, 'guest'),
  viewerArrayErrorMessage: getUsersErrorMessage(state, 'viewer'),
  userArray: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
  workTeams: getWorkTeams(state),
});

const mapDispatch = {
  updateUser,
  loadUserList,
  findUser,
  loadWorkTeams,
  createWorkTeam,
  notifyUser,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserPanel));
