import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  updateUser,
  fetchUser,
  fetchProfileData,
  loadMessages,
  deleteUser,
} from '../../actions/user';
import { logout } from '../../actions/session';

import { verifyEmail } from '../../actions/verifyEmail';
import { loadLogs } from '../../actions/log';
import { Groups } from '../../organization';
import { createRequest, deleteRequest } from '../../actions/request';
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
import { uploadAvatar, uploadFiles } from '../../actions/file';
import { createMessage } from '../../actions/message';
import { genProposalPageKey } from '../../reducers/pageInfo';
import Label from '../../components/Label';
import {
  getUser,
  getSessionUser,
  getAccountUpdates,
  getRequestUpdates,
  getPushSubscription,
  getWorkTeams,
  getLogs,
  getLogIsFetching,
  getLogErrorMessage,
  getMessageUpdates,
  getLayoutSize,
  getResourcePageInfo,
  getAllProposals,
  getUploadStatus,
} from '../../reducers';
import Avatar from '../../components/Avatar';
import UserSettings from '../../components/UserSettings';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import ImageUpload from '../../components/ImageUpload';
import Box from '../../components/Box';
import Button from '../../components/Button';
import { isPushAvailable } from '../../core/helpers';
import { ICONS } from '../../constants';
import ActivityLog from '../../components/ActivityLog';
import Notification from '../../components/Notification';
import Profile from '../../components/UserProfile';
import s from './AccountContainer.css';
import NotificationSettings from '../../components/NotificationSettings';
import MessagePreview from '../../components/MessagePreview/MessagePreview';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import history from '../../history';
import ListView from '../../components/ListView';
import ProposalPreview from '../../components/ProposalPreview';
import VerificationUploadMask from './VerificationUploadMask';
import { VerificationTypes } from '../../data/models/constants';
import Layer from '../../components/Layer/Layer';

const messages = defineMessages({
  settings: {
    id: 'settings',
    defaultMessage: 'Settings',
    description: 'Label for settings',
  },
  verificationCall: {
    id: 'settings.verificationCall',
    defaultMessage:
      'Confirm your email address. A confirmation message was sent to ({email})',
    description: 'Notification to verify mail address',
  },
  uploadCall: {
    id: 'settings.uploadCall',
    defaultMessage: 'Please upload a photo of yourself',
    description: 'Notification to upload photo',
  },
  waitCall: {
    id: 'settings.waitCall',
    defaultMessage: 'You will be contacted as soon as possible',
    description: 'Notification to upload photo',
  },
  verifyCall: {
    id: 'settings.verifyCall',
    defaultMessage:
      'Verify your identity to vote, comment and work on proposals',
    description: 'Notification to verify identity',
  },
  verifyWaitCall: {
    id: 'settings.verifyWaitCall',
    defaultMessage:
      'Your verification request will be processed as soon as possible',
    description: 'Notification to verify identity progress',
  },
  verifyDeniedCall: {
    id: 'settings.verifyDeniedCall',
    defaultMessage:
      'Your verification request was denied. Try again or contact us directly',
    description: 'Notification of verification denial',
  },
  followees: {
    id: 'profile.followees',
    defaultMessage: 'Followees',
    description: 'Followees',
  },

  notificationSettings: {
    id: 'label.notificationSettings',
    defaultMessage: 'Notification settings',
    description: 'Label for notification settings',
  },
  messages: {
    id: 'label.messages',
    description: 'Messages label',
    defaultMessage: 'Messages',
  },
});

const renderFollowee = (data, fn, del) => (
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
      {del && (
        <svg viewBox="0 0 24 24" width="24px" height="24px">
          <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.delete} />
        </svg>
      )}
    </Button>
  </li>
);

// TODO use ListView OR enhance List w errorhandlers etc
const renderMessageList = data => {
  if (data) {
    return (
      <List>
        {data.map(m => (
          <ListItem onClick={() => history.push(`/message/${m.id}`)}>
            <MessagePreview
              sender={m.sender}
              subject={m.subject}
              createdAt={m.createdAt}
              numReplies={m.numReplies}
            />
          </ListItem>
        ))}
      </List>
    );
  }

  return <List> No item found </List>;
};

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
    uploadFiles: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    updates: PropTypes.object.isRequired,
    small: PropTypes.bool.isRequired,
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
    sessionUser: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
    }).isRequired,
    logout: PropTypes.func.isRequired,
    requestUpdates: PropTypes.shape({}).isRequired,
    deleteRequest: PropTypes.func.isRequired,
    createRequest: PropTypes.func.isRequired,
    loadMessages: PropTypes.func.isRequired,
    createMessage: PropTypes.func.isRequired,
    messageUpdates: PropTypes.shape({}).isRequired,
    proposals: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pageInfo: PropTypes.shape({}).isRequired,
    uploadStatus: PropTypes.shape({ pending: PropTypes.bool }),
  };

  static defaultProps = {
    logs: null,
    logError: null,
    workTeams: null,
    uploadStatus: null,
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
    this.onNotify = this.onNotify.bind(this);
    this.fetchLogs = this.fetchLogs.bind(this);
    this.fetchMessages = this.fetchMessages.bind(this);
    this.toggleVerification = this.toggleVerification.bind(this);
    this.getNotification = this.getNotification.bind(this);
  }

  componentDidMount() {
    const { user } = this.props;
    this.getUserData(user);
  }

  componentWillReceiveProps({ updates, subscription, user }) {
    const { user: oldUser, updates: oldUpdates } = this.props;
    if (updates.dataUrl && updates.dataUrl.success) {
      this.setState({ showUpload: false });
    }

    if (
      updates.verification &&
      updates.verification.success &&
      !(oldUpdates.verification && oldUpdates.verification.success)
    ) {
      this.toggleVerification();
    }
    if (subscription) {
      this.setState({ disableSubscription: subscription.disabled });
    }
    // eslint-disable-next-line eqeqeq
    if (user.id != oldUser.id) {
      this.getUserData(user);
    }
  }

  componentWillUnmount() {
    if (this.responsive) {
      this.responsive.stop();
    }
  }

  onNotify(values) {
    const { createMessage: notify, user, sessionUser } = this.props;
    notify({
      recipientType: 'USER',
      messageType: 'COMMUNICATION',
      recipients: [user.id],
      subject: {
        de: `Private message from ${sessionUser.name} ${sessionUser.surname}`,
      },
      communication: {
        textHtml: values.text,
        replyable: true,
      },
    });
  }

  getNotification(ownAccount, user) {
    let messageId;
    let action;
    if (ownAccount && !user.emailVerified) {
      messageId = 'verificationCall';
    } else if (ownAccount && user.groups === Groups.GUEST && !user.thumbnail) {
      messageId = 'uploadCall';
      // eslint-disable-next-line no-bitwise
    } else if (ownAccount && user.groups === Groups.GUEST) {
      messageId = 'waitCall';
    } else if (user.verificationStatus === VerificationTypes.UNREQUESTED) {
      messageId = 'verifyCall';
      action = <Button onClick={this.toggleVerification}>Verify</Button>;
    } else if (user.verificationStatus === VerificationTypes.PENDING) {
      messageId = 'verifyWaitCall';
    } else if (user.verificationStatus === VerificationTypes.DENIED) {
      messageId = 'verifyDenied';
    }
    return (
      messageId && (
        <Notification
          type="alert"
          action={action}
          message={
            <FormattedMessage
              {...messages[messageId]}
              values={{ email: user.email }}
            />
          }
        />
      )
    );
  }

  getUserData(user) {
    const { id } = user;
    const {
      sessionUser,
      fetchUser: loadUser,
      checkSubscription: checkSub,
      fetched,
      fetchProfileData: loadProfileData,
    } = this.props;
    if (!sessionUser) return;
    // eslint-disable-next-line eqeqeq
    if (user.id == sessionUser.id) {
      loadUser({ id });
      const pushAvailable = isPushAvailable();
      if (pushAvailable) {
        checkSub();
      }
    } else if (!fetched) {
      loadProfileData({ id });
    }
  }

  toggleVerification() {
    this.setState(prevState => ({
      openVerification: !prevState.openVerification,
    }));
  }

  handleWPSubscription() {
    const {
      subscription,
      deleteWebPushSub: deleteSub,
      createWebPushSub: createSub,
    } = this.props;
    if (subscription.isPushEnabled) {
      deleteSub();
    } else {
      createSub();
    }
  }

  handleImageChange() {
    this.setState({ showUpload: true });
  }

  fetchLogs() {
    const { loadLogs: fetchLogs } = this.props;
    fetchLogs(true);
  }

  fetchMessages() {
    const { loadMessages: fetchMessages, user } = this.props;
    fetchMessages(user.id);
  }

  render() {
    const {
      subscription,
      updates,
      ownAccount,
      logs,
      logError,
      logPending,
      user,
      requestUpdates,
      messageUpdates,
      fetchUser: loadUser,
      sessionUser,
      updateUser: mutateUser,
      uploadAvatar: saveAvatar,
      uploadFiles: upload,
      verifyEmail: emailVerification,
      deleteRequest: cancelRequest,
      createRequest: makeRequest,
      joinWorkTeam: join,
      leaveWorkTeam: leave,
      workTeams,
      deleteUser: deleteAccount,
      logout: onLogout,
      small,
      proposals,
      pageInfo,
      uploadStatus,
    } = this.props;

    const {
      editFollowees,
      showUpload,
      disableSubscription,
      openVerification,
    } = this.state;
    if (!user) return null;
    const { followees = [] } = user;
    const notification = this.getNotification(ownAccount, user);

    const profile = (
      <Profile
        ownAccount={ownAccount}
        onImageChange={this.handleImageChange}
        user={user}
        fetchProfileData={loadUser}
        updates={updates}
        messageUpdates={messageUpdates}
        onSend={this.onNotify}
        sessionUser={sessionUser}
        toggleVerification={this.toggleVerification}
      />
    );
    if (!ownAccount) {
      return (
        <Box padding="medium" justify>
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
              this.setState({ editFollowees: !editFollowees });
            }}
          />

          <Box wrap tag="ul" className={s.followeeContainer}>
            {followees.map(f =>
              renderFollowee(
                { userId: user.id, followee: f },
                mutateUser,
                editFollowees,
              ),
            )}
          </Box>
          {/* eslint-enable jsx-a11y/no-static-element-interactions */}
        </div>
      );
    }

    let displayLog;
    if (logs && logs.length) {
      const deletedVotes = {};
      // TODO refactor
      displayLog = logs.map(a => {
        // eslint-disable-next-line no-underscore-dangle
        if (a.object && a.object.__typename === 'VoteDL') {
          if (deletedVotes[a.objectId]) {
            return (
              <ActivityLog
                key={a.id}
                actor={a.actor}
                date={a.createdAt}
                verb="delete"
                content={a.object}
                info={a.info}
              />
            );
          }
          if (a.verb === 'delete') {
            deletedVotes[a.objectId] = true;
          }
        }
        return (
          <ActivityLog
            key={a.id}
            actor={a.actor}
            date={a.createdAt}
            verb={a.verb}
            content={a.object}
            info={a.info}
          />
        );
      });
    } else if (logPending) {
      displayLog = 'Loading...';
    } else if (logError) {
      displayLog = (
        <Notification
          type="error"
          message={logError}
          action={<Button primary label="Retry" onClick={this.fetchLogs} />}
        />
      );
    } else {
      displayLog = 'No data';
    }

    let ProposalPanel = <div />;
    if (proposals && proposals.length) {
      ProposalPanel = (
        <AccordionPanel column heading="My proposals">
          {proposals && (
            <ListView
              onRetry={this.handleOnRetry}
              onLoadMore={this.handleLoadMore}
              pageInfo={pageInfo}
            >
              {proposals.map(
                proposal =>
                  proposal && (
                    <ProposalPreview
                      proposal={{
                        ...proposal,
                        image: proposal.image && `/s460/${proposal.image}`,
                      }}
                      onClick={this.onProposalClick}
                    />
                  ),
              )}
            </ListView>
          )}
        </AccordionPanel>
      );
    }
    return (
      <Box tag="article" column padding="medium">
        {notification}
        <Box between column={small}>
          {showUpload && (
            <ImageUpload
              uploadAvatar={data => {
                saveAvatar({ ...data, id: user.id });
              }}
              uploadPending={updates.dataUrl && updates.dataUrl.pending}
              uploadError={updates.dataUrl && updates.dataUrl.error}
              uploadSuccess={updates.dataUrl && updates.dataUrl.success}
              ratio={1}
              onClose={() => {
                this.setState({ showUpload: false });
              }}
            />
          )}
          {openVerification && (
            <Layer fill onClose={this.toggleVerification}>
              <VerificationUploadMask
                upload={upload}
                update={mutateUser}
                pending={
                  uploadStatus.pending ||
                  (updates.verification && updates.verification.pending)
                }
                error={updates.verification && updates.verification.error}
                userId={user.id}
              />
            </Layer>
          )}
          {profile}

          <Box column flex>
            {followeeContainer}
            <Accordion openMulti>
              <AccordionPanel
                column
                onActive={this.fetchMessages}
                heading={<FormattedMessage {...messages.messages} />}
              >
                <Label> Messages received</Label>
                {renderMessageList(user.messagesReceived)}

                <Label> Messages sent</Label>

                {renderMessageList(user.messagesSent)}
              </AccordionPanel>
              <AccordionPanel
                heading={<FormattedMessage {...messages.settings} />}
              >
                <div style={{ marginTop: '1em' }}>
                  <UserSettings
                    smallSize={small}
                    resendEmail={emailVerification}
                    deleteRequest={cancelRequest}
                    updates={updates}
                    requestUpdates={requestUpdates}
                    user={user}
                    updateUser={mutateUser}
                    createRequest={makeRequest}
                    onJoinWorkTeam={join}
                    onLeaveWorkTeam={leave}
                    workTeams={workTeams}
                    onDeleteAccount={deleteAccount}
                    onLogout={onLogout}
                  />
                </div>
              </AccordionPanel>
              <AccordionPanel heading="Log" column onActive={this.fetchLogs}>
                {displayLog}
              </AccordionPanel>
              <AccordionPanel
                heading={
                  <FormattedMessage {...messages.notificationSettings} />
                }
              >
                <NotificationSettings
                  user={user}
                  update={mutateUser}
                  updates={updates && updates.notificationSettings}
                  pushSubscription={subscription}
                  onPushSubChange={this.handleWPSubscription}
                  disableSubscription={disableSubscription}
                />
              </AccordionPanel>
              {ProposalPanel}
            </Accordion>
          </Box>
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
  createRequest,
  deleteRequest,
  loadMessages,
  createMessage,
  deleteUser,
  logout,
  uploadFiles,
};
const mapStateToProps = (state, { user }) => ({
  user: getUser(state, user.id) || user,
  sessionUser: getSessionUser(state),
  requestUpdates: getRequestUpdates(state),
  updates: getAccountUpdates(state, user.id),
  subscription: getPushSubscription(state),
  workTeams: getWorkTeams(state),
  logs: getLogs(state),
  logPending: getLogIsFetching(state),
  logError: getLogErrorMessage(state),
  messageUpdates: getMessageUpdates(state),
  small: getLayoutSize(state),
  proposals: getAllProposals(state, 'active').filter(proposal =>
    proposal.spokesman ? proposal.spokesman.id == user.id : false,
  ),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: 'active' }),
  ),
  uploadStatus: getUploadStatus(state),
});

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(AccountContainer));
