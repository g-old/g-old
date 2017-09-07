import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import { updateUser, fetchUser, fetchProfileData } from '../../actions/user';
import { verifyEmail } from '../../actions/verifyEmail';
import { loadLogs } from '../../actions/log';

import {
  createWebPushSub,
  deleteWebPushSub,
  checkSubscription,
} from '../../actions/subscriptions';
import {
  loadWorkTeams,
  joinWorkTeam,
  leaveWorkTeam,
} from '../../actions/workTeam';
import { loadFeed } from '../../actions/feed';
import { uploadAvatar } from '../../actions/file';
import {
  getUser,
  getAccountUpdates,
  getSubscription,
  getWorkTeams,
  getLogs,
  getLogIsFetching,
  getLogErrorMessage,
} from '../../reducers';
import Avatar from '../../components/Avatar';
import UserSettings from '../../components/UserSettings';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import ImageUpload from '../../components/ImageUpload';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { isPushAvailable } from '../../core/helpers';
import CheckBox from '../../components/CheckBox';
import { ICONS } from '../../constants';
import ActivityLog from '../../components/ActivityLog';
import Notification from '../../components/Notification';
import Profile from '../../components/UserProfile';
import s from './AccountContainer.css';

const messages = defineMessages({
  settings: {
    id: 'settings.title',
    defaultMessage: 'Settings',
    description: 'Header for settings',
  },
  followees: {
    id: 'profile.followees',
    defaultMessage: 'Followees',
    description: 'Followees',
  },
  economy: {
    id: 'workTeams.economy',
    defaultMessage: 'Economy',
    description: 'Economy',
  },
  environment: {
    id: 'workTeams.environment',
    defaultMessage: 'Environment',
    description: 'Environment',
  },
  urbanism: {
    id: 'workTeams.urbanism',
    defaultMessage: 'Urbanism',
    description: 'Urbanism',
  },
  mobility: {
    id: 'workTeams.mobility',
    defaultMessage: 'Mobilty and transport',
    description: 'Mobility',
  },
  health: {
    id: 'workTeams.health',
    defaultMessage: 'Public health systems and welfare',
    description: 'Health',
  },
  education: {
    id: 'workTeams.education',
    defaultMessage: 'Education, youth, sport',
    description: 'Education',
  },
  events: {
    id: 'workTeams.events',
    defaultMessage: 'Event organization, admission',
    description: 'Event',
  },
});

const renderFollowee = (data, fn, del) =>
  <li key={data.followee.id}>
    <Button
      disabled={!del}
      onClick={() => {
        if (del) {
          fn({
            id: data.userId,
            followee: data.followee.id,
            info: { delete: true, id: data.followee.id },
          });
        }
      }}
      plain
    >
      <Avatar user={data.followee} isFollowee />
      {del &&
        <svg viewBox="0 0 24 24" width="24px" height="24px">
          <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.delete} />
        </svg>}
    </Button>
  </li>;

/* const workTeams = [
  {
    value: '1',
    label: <FormattedMessage {...messages.economy} />,
    mId: messages.economy.id,
  },
  {
    value: '2',
    label: <FormattedMessage {...messages.environment} />,
    mId: messages.environment.id,
  },
  {
    value: '3',
    label: <FormattedMessage {...messages.urbanism} />,
    mId: messages.urbanism.id,
  },
  {
    value: '4',
    label: <FormattedMessage {...messages.mobility} />,
    mId: messages.mobility.id,
  },
  {
    value: '5',
    label: <FormattedMessage {...messages.health} />,
    mId: messages.health.id,
  },
  {
    value: '6',
    label: <FormattedMessage {...messages.education} />,
    mId: messages.education.id,
  },
  {
    value: '7',
    label: <FormattedMessage {...messages.events} />,
    mId: messages.events.id,
  },
]; */

class AccountContainer extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      avatar: PropTypes.string,
      numStatements: PropTypes.number,
      numFollowers: PropTypes.number,
      numLikes: PropTypes.number,
      workTeams: PropTypes.arrayOf(PropTypes.shape({})),
      followees: PropTypes.arrayOf(
        PropTypes.shape({
          avatar: PropTypes.isRequired,
        }),
      ),
    }).isRequired,
    updateUser: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    updates: PropTypes.object.isRequired,
    fetchUser: PropTypes.func.isRequired,
    uploadAvatar: PropTypes.func.isRequired,
    checkSubscription: PropTypes.func.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subscription: PropTypes.shape({
      pending: PropTypes.bool,
      isPushEnabled: PropTypes.bool,
      error: PropTypes.string,
      disabled: PropTypes.bool,
    }).isRequired,
    deleteWebPushSub: PropTypes.func.isRequired,
    createWebPushSub: PropTypes.func.isRequired,
    verifyEmail: PropTypes.func.isRequired,
    loadWorkTeams: PropTypes.func.isRequired, // TODO implement in settings
    joinWorkTeam: PropTypes.func.isRequired,
    leaveWorkTeam: PropTypes.func.isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})),
    loadLogs: PropTypes.func.isRequired,
    logs: PropTypes.arrayOf(PropTypes.shape({})),
    logPending: PropTypes.bool.isRequired,
    logError: PropTypes.shape({}),
    ownAccount: PropTypes.bool.isRequired,
    fetched: PropTypes.bool.isRequired,
    fetchProfileData: PropTypes.func.isRequired,
  };
  static defaultProps = {
    logs: null,
    logError: null,
  };
  constructor(props) {
    super(props);

    this.state = {
      showUpload: false,
      disableSubscription: true,
      editFollowees: false,
    };
    this.handleWPSubscription = this.handleWPSubscription.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.getUserData = this.getUserData.bind(this);
  }

  componentDidMount() {
    this.getUserData(this.props.user);
    //  this.props.loadWorkTeams();
    // this.props.loadFeed(true);
  }

  componentWillReceiveProps({ updates, subscription, user }) {
    if (updates.dataUrl && updates.dataUrl.success) {
      this.setState({ showUpload: false });
    }
    if (subscription) {
      this.setState({ disableSubscription: subscription.disabled });
    }
    // eslint-disable-next-line eqeqeq
    if (user.id != this.props.user.id) {
      this.getUserData(user);
    }
  }

  getUserData(user) {
    const { id } = user;
    if (this.props.ownAccount) {
      this.props.fetchUser({ id });
      const pushAvailable = isPushAvailable();
      if (pushAvailable) {
        this.props.checkSubscription();
      }
    } else if (!this.props.fetched) {
      this.props.fetchProfileData({ id });
    }
  }

  handleWPSubscription() {
    const { subscription } = this.props;
    if (subscription.isPushEnabled) {
      this.props.deleteWebPushSub();
    } else {
      this.props.createWebPushSub();
    }
  }

  handleImageChange() {
    this.setState({ showUpload: true });
  }

  render() {
    if (!this.props.user) return null;
    const { subscription, updates, ownAccount } = this.props;
    const { followees = [] } = this.props.user;
    const profile = (
      <Profile
        ownAccount={ownAccount}
        onImageChange={this.handleImageChange}
        user={this.props.user}
        fetchProfileData={this.props.fetchUser}
        updates={this.props.updates}
      />
    );
    if (!ownAccount) {
      return (
        <Box flex justify wrap className={s.account}>
          {profile}
        </Box>
      );
    }

    let followeeContainer;
    if (followees.length) {
      followeeContainer = (
        <div>
          {/* eslint-disable jsx-a11y/no-static-element-interactions */}

          <Button
            reverse
            label={<FormattedMessage {...messages.followees} />}
            plain
            icon={
              <svg viewBox="0 0 24 24" width="16px" height="16px">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M14,4 L20,10 L14,4 Z M22.2942268,5.29422684 C22.6840146,5.68401459 22.6812861,6.3187139 22.2864907,6.71350932 L9,20 L2,22 L4,15 L17.2864907,1.71350932 C17.680551,1.319449 18.3127724,1.31277239 18.7057732,1.70577316 L22.2942268,5.29422684 Z M3,19 L5,21 M7,17 L15,9"
                />
              </svg>
            }
            onClick={() => {
              this.setState({ editFollowees: !this.state.editFollowees });
            }}
          />

          <Box wrap tag="ul" className={s.followeeContainer}>
            {followees.map(f =>
              renderFollowee(
                { userId: this.props.user.id, followee: f },
                this.props.updateUser,
                this.state.editFollowees,
              ),
            )}
          </Box>
          {/* eslint-enable jsx-a11y/no-static-element-interactions */}
        </div>
      );
    }

    return (
      <Box flex justify wrap className={s.account}>
        {this.state.showUpload &&
          <ImageUpload
            uploadAvatar={data => {
              this.props.uploadAvatar({ ...data, id: this.props.user.id });
            }}
            uploadPending={updates.dataUrl && updates.dataUrl.pending}
            uploadError={updates.dataUrl && updates.dataUrl.error}
            uploadSuccess={updates.dataUrl && updates.dataUrl.success}
            onClose={() => {
              this.setState({ showUpload: false });
            }}
          />}
        {profile}

        <Box column flex className={s.details}>
          {followeeContainer}

          <FormField label={'WebPush'} error={subscription.error}>
            <CheckBox
              toggle
              checked={subscription.isPushEnabled}
              label={subscription.isPushEnabled ? 'ON' : 'OFF'}
              onChange={this.handleWPSubscription}
              disabled={this.state.disableSubscription || subscription.pending}
            />
          </FormField>
          <Accordion openMulti>
            <AccordionPanel
              heading={<FormattedMessage {...messages.settings} />}
              onActive={() => {
                this.props.loadWorkTeams();
              }}
            >
              <div style={{ marginTop: '1em' }}>
                <UserSettings
                  resendEmail={this.props.verifyEmail}
                  updates={updates}
                  user={this.props.user}
                  updateUser={this.props.updateUser}
                  onJoinWorkTeam={this.props.joinWorkTeam}
                  onLeaveWorkTeam={this.props.leaveWorkTeam}
                  workTeams={this.props.workTeams}
                />
              </div>
            </AccordionPanel>
            <AccordionPanel
              heading="Log / Notifications"
              onActive={() => {
                this.props.loadLogs(true);
              }}
            >
              {!this.props.logs.length && this.props.logPending && 'Loading...'}
              {!this.props.logs.length &&
                this.props.logError &&
                <Notification
                  type="error"
                  message={this.props.logError}
                  action={
                    <Button
                      label="Retry"
                      onClick={() => {
                        this.props.loadLogs(true);
                      }}
                    />
                  }
                />}
              {this.props.logs &&
                this.props.logs.map(a =>
                  <ActivityLog
                    key={a.id}
                    actor={a.actor}
                    date={a.createdAt}
                    verb={a.verb}
                    content={a.object}
                  />,
                )}
            </AccordionPanel>
          </Accordion>
        </Box>
      </Box>
    );
  }
}
const mapDispatch = {
  updateUser,
  fetchUser,
  uploadAvatar,
  createWebPushSub,
  deleteWebPushSub,
  checkSubscription,
  verifyEmail,
  loadWorkTeams,
  joinWorkTeam,
  leaveWorkTeam,
  loadFeed,
  loadLogs,
  fetchProfileData,
};
const mapStateToProps = (state, { user }) => ({
  user: getUser(state, user.id) || user,
  updates: getAccountUpdates(state, user.id),
  subscription: getSubscription(state),
  workTeams: getWorkTeams(state),
  logs: getLogs(state),
  logPending: getLogIsFetching(state),
  logError: getLogErrorMessage(state),
});

export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(AccountContainer),
);
