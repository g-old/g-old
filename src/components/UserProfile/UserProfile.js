import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import { updateUser, fetchUser } from '../../actions/user';
import { createWebPushSub, deleteWebPushSub, checkSubscription } from '../../actions/subscriptions';
import { uploadAvatar } from '../../actions/file';
import s from './UserProfile.css';
import { getSessionUser, getAccountUpdates, getSubscription } from '../../reducers';
import Avatar from '../Avatar';
import Icon from '../Icon';
import UserSettings from '../UserSettings';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';
import ImageUpload from '../ImageUpload';
import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import Value from '../Value';
import { isPushAvailable } from '../../core/helpers';

const messages = defineMessages({
  settings: {
    id: 'settings.title',
    defaultMessage: 'Settings',
    description: 'Header for settings',
  },
});

const renderFollowee = (data, fn) =>
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  (<li
    key={data.followee.id}
    style={{ display: 'inline' }}
    onClick={() => {
      fn({
        id: data.userId,
        followee: data.followee.id,
        info: { delete: true, id: data.followee.id },
      });
    }}
  >
    <Avatar user={data.followee} isFollowee />
  </li>);
/* eslint-enable jsx-a11y/no-static-element-interactions */

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      avatar: PropTypes.string,
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

    const { avatar, name, surname, followees } = this.props.user;
    let uploadButton = (
      <Button
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
        <Box>
          <div>
            <Box pad column>
              <img className={s.avatar} src={avatar} alt="IMG" />
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
            </Box>
            <h3>{name}</h3>
            <h3>{surname}</h3>
            <h3>{'Some Data'}</h3>
            <Box pad>
              <Value label="Followers" value={101} />
              <Value
                icon={
                  <svg
                    version="1.1"
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                    aria-label="star"
                  >
                    <polygon
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      points="5 21 8 14 3 9 9 9 12 3 15 9 21 9 16 14 19 21 12 17"
                    />
                  </svg>
                }
                label="Likes"
                value={999}
              />
              <Value label="Statements" value={1337} />
            </Box>
            <div>
              <Icon
                icon={
                  'M24 24.082v-1.649c2.203-1.241 4-4.337 4-7.432 0-4.971 0-9-6-9s-6 4.029-6 9c0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h28c0-4.030-5.216-7.364-12-7.918z M10.225 24.854c1.728-1.13 3.877-1.989 6.243-2.513-0.47-0.556-0.897-1.176-1.265-1.844-0.95-1.726-1.453-3.627-1.453-5.497 0-2.689 0-5.228 0.956-7.305 0.928-2.016 2.598-3.265 4.976-3.734-0.529-2.39-1.936-3.961-5.682-3.961-6 0-6 4.029-6 9 0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h8.719c0.454-0.403 0.956-0.787 1.506-1.146z'
                }
              />
              <h3>Followees </h3>

              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              {followees &&
                <ul style={{ listStyle: 'none' }}>
                  {followees.map(f =>
                    renderFollowee(
                      { userId: this.props.user.id, followee: f },
                      this.props.updateUser,
                    ),
                  )}
                </ul>}
              {/* eslint-enable jsx-a11y/no-static-element-interactions */}

            </div>
            <FormField label={'WebPush'} error={subscription.error}>
              <Button
                primary={!subscription.isPushEnabled}
                label={subscription.isPushEnabled ? 'UNSUBSCRIBEFROMPUSH' : 'SUBSCRIBEFORPUSH'}
                disabled={this.state.disableSubscription || subscription.pending}
                onClick={this.handleWPSubscription}
              />
            </FormField>
          </div>
        </Box>
        <div style={{ width: '100%' }}>
          <Accordion>
            <AccordionPanel heading={<FormattedMessage {...messages.settings} />}>
              <div style={{ marginTop: '1em' }}>
                <UserSettings
                  updates={updates}
                  user={this.props.user}
                  updateUser={this.props.updateUser}
                />
              </div>
            </AccordionPanel>
          </Accordion>
        </div>
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
};
const mapStateToProps = (state, { user }) => ({
  user: getSessionUser(state),
  updates: getAccountUpdates(state, user.id),
  subscription: getSubscription(state),
});

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserProfile));
