import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { fetchUser, deleteUser } from '../../actions/user';
import { getUser, getAccountUpdates, getMessageUpdates } from '../../reducers';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import RightsManager from '../RightsManager';
import GroupManager from '../GroupManager';
// import { PRIVILEGES } from '../../constants';
import { Groups, AccessMasks, canAccess } from '../../organization';
import ImageUpload from '../ImageUpload';
import { uploadAvatar } from '../../actions/file';
import { createMessage } from '../../actions/message';
import ProfilePicture from '../ProfilePicture';
import Box from '../Box';
import MessageInput from '../MessageInput';
import Notification from '../Notification';
import Label from '../Label';
import s from './AccountDetails.css';
import Button from '../Button';

const messages = defineMessages({
  headerRights: {
    id: 'rights.header',
    defaultMessage: 'Rights',
    description: 'Header of privilegemanager',
  },
  headerGroups: {
    id: 'roles.header',
    defaultMessage: 'Set & Change Groups',
    description: 'Header of groupsemanager',
  },
  emailValidationMissing: {
    id: 'account.emailValidationMissing',
    defaultMessage: 'Email not validated',
    description: 'Email not validated',
  },
  workteam: {
    id: 'account.workTeamMissing',
    defaultMessage: 'No team choosen',
    description: 'No team choosen',
  },
  lastLogin: {
    id: 'account.lastLogin',
    defaultMessage: 'Last login at',
    description: 'Last login date',
  },
  avatarMissing: {
    id: 'account.avatarMissing',
    defaultMessage: 'No photo set',
    description: 'Avatar missing',
  },
  notify: {
    id: 'account.notify',
    defaultMessage: 'Notify user',
    description: 'Contact user',
  },
  delete: {
    id: 'account.delete',
    defaultMessage: 'Delete account',
    description: 'Deleting the account',
  },
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
});
const checkAvatar = url => (url ? url.indexOf('cloudinary') !== -1 : false);

/* const renderGroups = groups =>
  Object.keys(Groups).reduce((acc, curr) => {
    if (groups & Groups[curr]) {
      acc.push(<div>{curr}</div>);
    }
    return acc;
  }, []); */

class AccountDetails extends React.Component {
  static propTypes = {
    accountData: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      avatar: PropTypes.string,
      privilege: PropTypes.string,
      emailVerified: PropTypes.bool,
      lastLogin: PropTypes.string,
      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }).isRequired,
    update: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    accountId: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      privilege: PropTypes.string,
      role: PropTypes.shape({ type: PropTypes.string }),
    }).isRequired,
    uploadAvatar: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      dataUrl: PropTypes.string,
      message: PropTypes.shape({
        success: PropTypes.bool,
        pending: PropTypes.bool,
      }),
    }).isRequired,
    createMessage: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    messageUpdates: PropTypes.shape({}).isRequired,
  };

  constructor(props) {
    super(props);
    // this.props.fetchUser({ id: props.accountId });
    this.onPromoteToViewer = this.onPromoteToViewer.bind(this);
    this.displayUploadLayer = this.displayUploadLayer.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.state = {
      showUpload: false,
    };
  }

  componentDidMount(props) {
    const { fetchUser: loadUser, accountId } = this.props;
    if (props && props.accountId) {
      loadUser({ id: accountId });
    }
  }

  componentWillReceiveProps({ accountId, updates }) {
    const { accountId: oldAccountId, fetchUser: loadUser } = this.props;
    if (accountId && accountId !== oldAccountId) {
      loadUser({ id: accountId });
    }
    if (updates.dataUrl && updates.dataUrl.success) {
      this.setState({ showUpload: false });
    }
  }

  onPromoteToViewer() {
    const {
      update,
      accountData: { groups, id },
    } = this.props;
    if (groups === Groups.GUEST) {
      update({
        id,
        groups: groups | Groups.VIEWER, // eslint-disable-line no-bitwise
      });
    }
  }

  handleDelete() {
    const { deleteUser: eraseUser, accountData } = this.props;
    eraseUser({ id: accountData.id });
  }

  displayUploadLayer() {
    this.setState({ showUpload: true });
  }

  render() {
    const {
      updates,
      accountData,
      user,
      update,
      createMessage: makeMessage,
      messageUpdates,
      uploadAvatar: uploadPicture,
    } = this.props;
    const { showUpload } = this.state;
    if (!accountData) {
      return null;
    }
    const {
      id,
      avatar,
      name,
      surname,
      emailVerified,
      lastLogin,
      groups,
      thumbnail,
    } = accountData;

    let RightsPanel = <div />;
    // eslint-disable-next-line no-bitwise
    if (groups != null && (user.privileges & AccessMasks.GROUPS_MANAGER) > 0) {
      RightsPanel = (
        <AccordionPanel
          heading={<FormattedMessage {...messages.headerRights} />}
        >
          <RightsManager
            updates={updates.privilege}
            updateFn={update}
            account={accountData}
            id={id}
          />
        </AccordionPanel>
      );
    }

    let GroupPanel = <div />;

    if (groups != null && canAccess(user, 'GroupsPanel')) {
      GroupPanel = (
        <AccordionPanel
          heading={<FormattedMessage {...messages.headerGroups} />}
        >
          <GroupManager
            updates={updates.role}
            account={accountData}
            updateFn={update}
            user={user}
          />
        </AccordionPanel>
      );
    }

    let MessagePanel = <div />;
    // eslint-disable-next-line no-bitwise
    if (canAccess(user, 'MessagePanel')) {
      MessagePanel = (
        <AccordionPanel column pad heading="Notify user">
          <MessageInput
            recipients={[id]}
            recipientType="USER"
            messageType="COMMUNICATION"
            notifyUser={makeMessage}
            updates={messageUpdates}
          />
        </AccordionPanel>
      );
    }

    const avatarSet = checkAvatar(avatar || thumbnail);
    return (
      <Box className={s.root} flex wrap>
        <Box className={s.profile} flex pad align column>
          {showUpload && (
            <ImageUpload
              uploadAvatar={data => {
                uploadPicture({ ...data, id });
              }}
              uploadPending={updates.dataUrl && updates.dataUrl.pending}
              uploadError={updates.dataUrl && updates.dataUrl.error}
              uploadSuccess={updates.dataUrl && updates.dataUrl.success}
              onClose={() => {
                this.setState({ showUpload: false });
              }}
              ratio={1}
            />
          )}
          <ProfilePicture
            user={accountData}
            img={avatar}
            canChange
            onChange={this.displayUploadLayer}
            updates={updates.dataUrl}
          />
          <Label>
            {name} {surname}
          </Label>
          {!avatarSet && (
            <Notification
              type="alert"
              message={<FormattedMessage {...messages.avatarMissing} />}
            />
          )}
          {!emailVerified && (
            <Notification
              type="alert"
              message={
                <FormattedMessage {...messages.emailValidationMissing} />
              }
            />
          )}

          {/* <span>
            <FormattedMessage {...messages.role} />
            {':'}
          </span>
         <div className={s.groups}>{renderGroups(groups)}</div> */}

          <span>
            <FormattedMessage {...messages.lastLogin} />:
            {lastLogin ? <FormattedDate value={lastLogin} /> : null}
          </span>
        </Box>
        {/* eslint-disable eqeqeq */}
        {user.id != id && (
          <Box column flex className={s.details}>
            <Accordion column>
              {GroupPanel}
              {RightsPanel}
              {MessagePanel}
            </Accordion>
            {groups === Groups.GUEST && (
              <Box justify>
                <Button
                  onClick={this.handleDelete}
                  primary
                  label={<FormattedMessage {...messages.delete} />}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
}
const mapStateToProps = (state, { accountId }) => ({
  accountData: getUser(state, accountId),
  updates: getAccountUpdates(state, accountId),
  messageUpdates: getMessageUpdates(state),
});
const mapDispatch = {
  fetchUser,
  uploadAvatar,
  createMessage,
  deleteUser,
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(AccountDetails));
