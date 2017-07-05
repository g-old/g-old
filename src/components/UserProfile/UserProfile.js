import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import { updateUser, fetchUser } from '../../actions/user';
import { verifyEmail } from '../../actions/verifyEmail';
import { createWebPushSub, deleteWebPushSub, checkSubscription } from '../../actions/subscriptions';
import { uploadAvatar } from '../../actions/file';
import s from './UserProfile.css';
import { getSessionUser, getAccountUpdates, getSubscription } from '../../reducers';
import Avatar from '../Avatar';
import UserSettings from '../UserSettings';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import ImageUpload from '../ImageUpload';
import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import Value from '../Value';
import Label from '../Label';
import { isPushAvailable } from '../../core/helpers';
import CheckBox from '../CheckBox';

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
});

const renderFollowee = (data, fn) =>
  (<li key={data.followee.id}>
    <Button
      onClick={() => {
        fn({
          id: data.userId,
          followee: data.followee.id,
          info: { delete: true, id: data.followee.id },
        });
      }}
      plain
    >
      <Avatar user={data.followee} isFollowee />
    </Button>

  </li>);

class UserProfile extends React.Component {
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
  };
  constructor(props) {
    super(props);

    this.state = { showUpload: false, disableSubscription: true };
    this.handleWPSubscription = this.handleWPSubscription.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.user;
    this.props.fetchUser({ id });
    const pushAvailable = isPushAvailable();
    if (pushAvailable) {
      this.props.checkSubscription();
    }
  }

  componentWillReceiveProps({ updates, subscription }) {
    if (updates.dataUrl && updates.dataUrl.success) {
      this.setState({ showUpload: false });
    }
    if (subscription) {
      this.setState({ disableSubscription: subscription.disabled });
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

  render() {
    if (!this.props.user) return null;
    const { subscription, updates } = this.props;

    const {
      avatar,
      name,
      surname,
      followees,
      numStatements,
      numFollowers,
      numLikes,
    } = this.props.user;
    let uploadButton = (
      <Button
        fill
        label={'Change image'}
        onClick={() => {
          this.setState({ showUpload: true });
        }}
        disabled={this.state.showUpload}
      />
    );
    if (updates.dataUrl && updates.dataUrl.success) {
      uploadButton = null;
    }

    return (
      <Box wrap>
        <Box flex>
          <Box pad column>
            <div style={{ display: 'inline' }}>
              <img className={s.avatar} src={avatar} alt="IMG" style={{ display: 'block' }} />

            </div>

            {uploadButton}
            {this.state.showUpload &&
              <ImageUpload
                uploadAvatar={(data) => {
                  this.props.uploadAvatar({ ...data, id: this.props.user.id });
                }}
                uploadPending={updates.dataUrl && updates.dataUrl.pending}
                uploadError={updates.dataUrl && updates.dataUrl.error}
                uploadSuccess={updates.dataUrl && updates.dataUrl.success}
                onClose={() => {
                  this.setState({ showUpload: false });
                }}
              />}

            <Label>{name} {surname}</Label>
            <Box pad>
              <Value
                icon={
                  <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                    />
                  </svg>
                }
                label="Followers"
                value={numFollowers || 0}
              />
              <Value
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                    aria-label="favorite"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M2,8.4 C2,4 5,3 7,3 C9,3 11,5 12,6.5 C13,5 15,3 17,3 C19,3 22,4 22,8.4 C22,15 12,21 12,21 C12,21 2,15 2,8.4 Z"
                    />
                  </svg>
                }
                label="Likes"
                value={numLikes || 0}
              />
              <Value
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                    aria-label="contact"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M1,2 L22,2 L22,18 L14,18 L6,22 L6,18 L1,18 L1,2 Z M6,10 L7,10 L7,11 L6,11 L6,10 Z M11,10 L12,10 L12,11 L11,11 L11,10 Z M16,10 L17,10 L17,11 L16,11 L16,10 Z"
                    />
                  </svg>
                }
                label="Statements"
                value={numStatements || 0}
              />
            </Box>
            <div>

              <Label><FormattedMessage {...messages.followees} /></Label>
              <Button
                plain
                icon={
                  <svg viewBox="0 0 24 24" width="24px" height="24px">
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d="M14,4 L20,10 L14,4 Z M22.2942268,5.29422684 C22.6840146,5.68401459 22.6812861,6.3187139 22.2864907,6.71350932 L9,20 L2,22 L4,15 L17.2864907,1.71350932 C17.680551,1.319449 18.3127724,1.31277239 18.7057732,1.70577316 L22.2942268,5.29422684 Z M3,19 L5,21 M7,17 L15,9"
                    />
                  </svg>
                }
              />
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              {followees &&
                <Box wrap tag="ul" className={s.followeeContainer}>
                  {followees.map(f =>
                    renderFollowee(
                      { userId: this.props.user.id, followee: f },
                      this.props.updateUser,
                    ),
                  )}
                </Box>}
              {/* eslint-enable jsx-a11y/no-static-element-interactions */}

            </div>
            <FormField label={'WebPush'} error={subscription.error}>
              {/* <Button
                fill
                primary={!subscription.isPushEnabled}
                label={subscription.isPushEnabled ? 'UNSUBSCRIBEFROMPUSH' : 'SUBSCRIBEFORPUSH'}
                disabled={this.state.disableSubscription || subscription.pending}
                onClick={this.handleWPSubscription}
              /> */}
              <CheckBox
                toggle
                checked={subscription.isPushEnabled}
                label={subscription.isPushEnabled ? 'ON' : 'OFF'}
                onChange={this.handleWPSubscription}
                disabled={this.state.disableSubscription || subscription.pending}
              />
            </FormField>
          </Box>
        </Box>

        <Box flex>
          <Accordion>
            <AccordionPanel heading={<FormattedMessage {...messages.settings} />}>
              <div style={{ marginTop: '1em' }}>
                <UserSettings
                  resendEmail={this.props.verifyEmail}
                  updates={updates}
                  user={this.props.user}
                  updateUser={this.props.updateUser}
                />
              </div>
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
};
const mapStateToProps = (state, { user }) => ({
  user: getSessionUser(state),
  updates: getAccountUpdates(state, user.id),
  subscription: getSubscription(state),
});

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserProfile));
