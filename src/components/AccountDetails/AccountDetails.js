import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { fetchUser } from '../../actions/user';
import { getUser, getAccountUpdates } from '../../reducers';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import PrivilegeManager from '../PrivilegeManager';
import RoleManager from '../RoleManager';
import { PRIVILEGES } from '../../constants';
import ImageUpload from '../ImageUpload';
import { uploadAvatar } from '../../actions/file';
import { notifyUser } from '../../actions/notifications';
import ProfilePicture from '../ProfilePicture';
import Box from '../Box';
import NotificationInput from '../NotificationInput';
import Notification from '../Notification';
import Label from '../Label';
import s from './AccountDetails.css';

const messages = defineMessages({
  headerPrivilege: {
    id: 'privilege.header',
    defaultMessage: 'Set & Change Privileges',
    description: 'Header of privilegemanager',
  },
  headerRole: {
    id: 'roles.header',
    defaultMessage: 'Set & Change Roles',
    description: 'Header of rolesemanager',
  },
  role: {
    id: 'account.role',
    defaultMessage: 'Role',
    description: 'Role of the user',
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
  changeRights: {
    id: 'account.changeRights',
    defaultMessage: 'Change users rights',
    description: 'Changing the rights of the user',
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
const checkAvatar = url => (url ? url.indexOf('http') !== -1 : false);

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
      notification: PropTypes.shape({
        success: PropTypes.bool,
        pending: PropTypes.bool,
      }),
    }).isRequired,
    notifyUser: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.fetchUser({ id: props.accountId });
    this.onPromoteToViewer = this.onPromoteToViewer.bind(this);
    this.displayUploadLayer = this.displayUploadLayer.bind(this);
    this.state = {
      showUpload: false,
    };
  }

  componentDidMount(props) {
    if (props && props.accountId) {
      this.props.fetchUser({ id: this.props.accountId });
    }
  }
  componentWillReceiveProps({ accountId, updates }) {
    if (accountId && accountId !== this.props.accountId) {
      this.props.fetchUser({ id: this.props.accountId });
    }
    if (updates.dataUrl && updates.dataUrl.success) {
      this.setState({ showUpload: false });
    }
    if (updates.notification && updates.notification.success) {
      this.setState({ notificationText: '', subject: '' });
    }
  }
  onPromoteToViewer() {
    if (this.props.accountData.role.type === 'guest') {
      this.props.update({ id: this.props.accountData.id, role: 'viewer' });
    }
  }

  displayUploadLayer() {
    this.setState({ showUpload: true });
  }

  render() {
    const { updates, accountData, user } = this.props;
    if (!accountData) {
      return null;
    }
    const {
      id,
      avatar,
      name,
      surname,
      role,
      emailVerified,
      lastLogin,
      privilege,
      workTeams,
    } = accountData;

    let PrivilegePanel = <div />;
    // eslint-disable-next-line no-bitwise
    if (privilege && user.privilege & PRIVILEGES.canModifyRights) {
      PrivilegePanel = (
        <PrivilegeManager
          updates={updates.privilege}
          updateFn={this.props.update}
          privilege={privilege}
          id={id}
        />
      );
    }

    let RolePanel = <div />;

    if (
      /* eslint-disable no-bitwise */
      privilege &&
      (user.privilege & PRIVILEGES.canModifyRights ||
        user.privilege & PRIVILEGES.canUnlockViewer ||
        user.privilege & PRIVILEGES.canUnlockUser ||
        user.privilege & PRIVILEGES.canUnlockMod)
      /* eslint-enable no-bitwise */
    ) {
      RolePanel = (
        <RoleManager
          updates={updates.role}
          account={accountData}
          updateFn={this.props.update}
          user={user}
        />
      );
    }

    let NotificationPanel = <div />;
    // eslint-disable-next-line no-bitwise
    if (privilege && user.privilege & PRIVILEGES.canNotifyUser) {
      NotificationPanel = (
        <AccordionPanel column pad heading={'Notify user'}>
          <NotificationInput
            receiverId={id}
            notifyUser={this.props.notifyUser}
            updates={this.props.updates && this.props.updates.notification}
            types={['email', 'notification']}
          />
        </AccordionPanel>
      );
    }

    const avatarSet = checkAvatar(avatar);
    const workTeamChoosen = workTeams ? workTeams.length > 0 : false;

    return (
      <Box className={s.root} flex wrap>
        <Box className={s.profile} flex pad align column>
          {this.state.showUpload &&
            <ImageUpload
              uploadAvatar={data => {
                this.props.uploadAvatar({ ...data, id });
              }}
              uploadPending={updates.dataUrl && updates.dataUrl.pending}
              uploadError={updates.dataUrl && updates.dataUrl.error}
              uploadSuccess={updates.dataUrl && updates.dataUrl.success}
              onClose={() => {
                this.setState({ showUpload: false });
              }}
            />}
          <ProfilePicture
            img={avatar}
            canChange
            onChange={this.displayUploadLayer}
            updates={updates.dataUrl}
          />
          <Label>
            {name} {surname}
          </Label>
          {!avatarSet &&
            <Notification
              type={'alert'}
              message={<FormattedMessage {...messages.avatarMissing} />}
            />}
          {!emailVerified &&
            <Notification
              type={'alert'}
              message={
                <FormattedMessage {...messages.emailValidationMissing} />
              }
            />}

          {!workTeamChoosen &&
            <Notification
              type={'alert'}
              message={<FormattedMessage {...messages.workteam} />}
            />}
          <span>
            <FormattedMessage {...messages.role} />: {role.type}{' '}
          </span>
          <span>
            <FormattedMessage {...messages.lastLogin} />:
            {lastLogin ? <FormattedDate value={lastLogin} /> : null}
          </span>
        </Box>
        {/* eslint-disable eqeqeq */}
        {user.id != id &&
          <Box flex className={s.details}>
            <Accordion column>
              <AccordionPanel
                heading={<FormattedMessage {...messages.headerRole} />}
              >
                {RolePanel}
              </AccordionPanel>
              <AccordionPanel
                heading={<FormattedMessage {...messages.headerPrivilege} />}
              >
                {PrivilegePanel}
              </AccordionPanel>
              {NotificationPanel}
            </Accordion>
          </Box>}
      </Box>
    );
  }
}
const mapStateToProps = (state, { accountId }) => ({
  accountData: getUser(state, accountId),
  updates: getAccountUpdates(state, accountId),
});
const mapDispatch = {
  fetchUser,
  uploadAvatar,
  notifyUser,
};
export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(AccountDetails),
);
