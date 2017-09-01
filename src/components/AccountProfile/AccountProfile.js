import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import Layer from '../Layer';
import { nameValidation, createValidator } from '../../core/validation';
import ProfilePicture from '../ProfilePicture';
import Box from '../Box';
import NotificationInput from '../NotificationInput';

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
const checkAvatar = url => url && url.indexOf('http') === -1;

class AccountProfile extends React.Component {
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
    onClose: PropTypes.func.isRequired,
    notifyUser: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.fetchUser({ id: props.accountId });
    this.onPromoteToViewer = this.onPromoteToViewer.bind(this);
    this.state = {
      showUpload: false,
    };
    const testValues = {
      subject: { fn: 'text' },
      notificationText: { fn: 'text' },
      name: { fn: 'name' },
      surname: { fn: 'name' },
      email: { fn: 'email' },
    };
    this.Validator = createValidator(
      testValues,
      {
        text: nameValidation,
      },
      this,
      obj => obj.state,
    );
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
          accountId={id}
          updateFn={this.props.update}
          userRole={this.props.user.role.type}
          accountRole={role.type}
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

    return (
      <Layer onClose={this.props.onClose}>
        <Box flex column>
          <ProfilePicture
            img={avatar}
            canChange
            onChange={() => {
              this.setState({ showUpload: true });
            }}
            updates={updates.dataUrl}
          />

          {this.state.showUpload &&
            <ImageUpload
              uploadAvatar={data => {
                this.props.uploadAvatar({ ...data, id });
              }}
              uploadPending={
                this.props.updates.dataUrl && this.props.updates.dataUrl.pending
              }
              uploadError={
                this.props.updates.dataUrl && this.props.updates.dataUrl.error
              }
              uploadSuccess={
                this.props.updates.dataUrl && this.props.updates.dataUrl.success
              }
              onClose={() => {
                this.setState({ showUpload: false });
              }}
            />}
          <div>
            <span>
              {name} {surname}
            </span>
            {!avatarSet &&
              <div>
                <FormattedMessage {...messages.avatarMissing} />
              </div>}
            {!emailVerified &&
              <div>
                <FormattedMessage {...messages.emailValidationMissing} />
              </div>}
            <div>
              <FormattedMessage {...messages.role} /> : {role.type}
            </div>

            <div>
              <FormattedMessage {...messages.lastLogin} /> :{' '}
              {<FormattedDate value={lastLogin} /> || 'No Data'}
            </div>
          </div>
        </Box>
        {/* eslint-disable eqeqeq */}
        {user.id != id &&
          <Box flex column>
            <Accordion>
              {RolePanel}
              {PrivilegePanel}
              {NotificationPanel}
            </Accordion>
          </Box>}
      </Layer>
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
export default connect(mapStateToProps, mapDispatch)(AccountProfile);
