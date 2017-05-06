import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './AccountProfile.css';
import { fetchUser } from '../../actions/user';
import { getUser, getAccountUpdates } from '../../reducers';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';

const messages = defineMessages({
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
      emailValidated: PropTypes.bool,
      lastLogin: PropTypes.string,
      role: PropTypes.shape({
        type: PropTypes.string,
      }),
    }).isRequired,
    update: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    accountId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.onPromoteToViewer = this.onPromoteToViewer.bind(this);
  }

  componentDidMount(props) {
    if (props && props.accountId) {
      this.props.fetchUser({ id: this.props.accountId });
    }
  }
  componentWillReceiveProps({ accountId }) {
    if (accountId && accountId !== this.props.accountId) {
      this.props.fetchUser({ id: this.props.accountId });
    }
  }
  onPromoteToViewer() {
    if (this.props.accountData.role.type === 'guest') {
      this.props.update({ id: this.props.accountData.id, role: 'viewer' });
    }
  }

  render() {
    if (!this.props.accountData) {
      return null;
    }
    const { avatar, name, surname, role, emailValidated, lastLogin } = this.props.accountData;
    const avatarSet = checkAvatar(avatar);
    return (
      <div>
        <img className={s.avatar} src={avatar} alt="IMG" />
        <div>
          <span>{name} {surname}</span>
          {!avatarSet &&
            <div>
              <FormattedMessage {...messages.avatarMissing} />
            </div>}
          {!emailValidated &&
            <div>
              <FormattedMessage {...messages.emailValidationMissing} />
            </div>}
          <div>
            <FormattedMessage {...messages.role} /> : {role.type}
          </div>

          <div>
            <FormattedMessage {...messages.lastLogin} /> : {lastLogin || 'No Data'}
          </div>
          <p>
            {role.type === 'guest' &&
              <button onClick={this.onPromoteToViewer}> PromoteToViewer </button>}
          </p>

          <p>

            <Accordion>
              <AccordionPanel heading={'Notify user'}>
                {'If you see this, you can notify users'} <br />

                WRITE
                <textarea />
                <p>
                  <button
                    onClick={() => {
                      alert('TO IMPLEMENT! \n mail, sms, accountmsg, messenger ?');
                    }}
                  >
                    <FormattedMessage {...messages.notify} />
                  </button>
                </p>
              </AccordionPanel>
              <AccordionPanel heading={'Rights'}>
                {'If you see this, you can change permissions/privileges'} <br />
                <input type="checkbox" value="Bike" /> {'can unlock Viewer'} <br />
                <input type="checkbox" value="Bike" /> {'can unlock User'}<br />
                <input type="checkbox" value="Bike" /> {'can unlock Mod'}<br />
                <input type="checkbox" value="Bike" /> {'can unlock Admin'}<br />
                <input type="checkbox" value="Bike" /> {'can change roles'}<br />
                <input type="checkbox" value="Bike" /> {'can change rights'}<br />
                <input type="checkbox" value="Bike" /> {'can notify users'}<br />

                <button
                  onClick={() => {
                    alert('TO IMPLEMENT! \n voteing, as mod, etc');
                  }}
                >
                  <FormattedMessage {...messages.changeRights} />
                </button>
                <br />
              </AccordionPanel>
            </Accordion>
          </p>
          <p>
            <button
              onClick={() => {
                alert('TO IMPLEMENT! \n soft, hard ?');
              }}
            >
              <FormattedMessage {...messages.delete} />
            </button>
          </p>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state, { accountId }) => ({
  accountData: getUser(state, accountId),
  updates: getAccountUpdates(state, accountId),
});
const mapDispatch = {
  fetchUser,
};
export default connect(mapStateToProps, mapDispatch)(withStyles(s)(AccountProfile));
