import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SignUp from '../../components/SignUp';
import ImageUpload from '../../components/ImageUpload';
import AccountSettings from '../../components/AccountSettings';
import { createUser } from '../../actions/user';
import { uploadAvatar } from '../../actions/file';
import { getAccountUpdates, getLocale } from '../../reducers';

class SignupContainer extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
    signupError: PropTypes.bool,
    processing: PropTypes.bool,
    uploadAvatar: PropTypes.func.isRequired,
    updates: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      serverCalled: false,
    };
    this.onCreateUser = this.onCreateUser.bind(this);
  }

  componentWillReceiveProps({ updates }) {
    if (updates) {
      const success = Object.keys(updates).find(key => !updates[key].success) == null;
      if (success && this.state.serverCalled) {
        this.setState({ step: 1 });
      }
    }
  }
  onCreateUser(data) {
    // dispatch
    this.props.createUser(data);
    this.setState({ serverCalled: true });
  }

  render() {
    const { updates } = this.props;

    switch (this.state.step) {
      case 0:
        return (
          <SignUp
            processing={this.props.processing}
            notUniqueEmail={(updates.email && updates.email.error) != null}
            error={this.props.signupError}
            onCreateUser={this.onCreateUser}
          />
        );
      case 1:
        return (
          <div>
            <h1>
              UPLOAD AVATAR - or later
            </h1>
            <ImageUpload
              uploadPending={updates.avatar && updates.avatar.pending}
              uploadSuccess={updates.avatar && updates.avatar.success}
              uploadError={updates.avatar && updates.avatar.error}
              uploadAvatar={this.props.uploadAvatar}
            />
            <AccountSettings />
          </div>
        );
      default:
        return <div />;
    }
  }
}
const mapStateToProps = (state, { updates = {} }) => ({
  updates: getAccountUpdates(state, '0000'),
  signupError: Object.keys(updates).find(key => updates[key].error) != null,
  processing: Object.keys(updates).find(key => updates[key].pending) != null,
  intl: getLocale(state), // fix for forceUpdate
});
const mapDispatch = {
  createUser,
  uploadAvatar,
};
export default connect(mapStateToProps, mapDispatch)(SignupContainer);
