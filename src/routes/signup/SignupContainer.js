import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SignUp from '../../components/SignUp';
import ImageUpload from '../../components/ImageUpload';
import AccountSettings from '../../components/AccountSettings';
import { createUser } from '../../actions/user';
import { uploadAvatar } from '../../actions/file';

class SignupContainer extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
    signupError: PropTypes.bool,
    notUniqueEmail: PropTypes.bool,
    processing: PropTypes.bool,
    uploadAvatar: PropTypes.func.isRequired,
    uploadPending: PropTypes.bool,
    uploaded: PropTypes.bool,
  };

  render() {
    switch (this.props.currentStep) {
      case 1:
        return (
          <SignUp
            processing={this.props.processing}
            notUniqueEmail={this.props.notUniqueEmail}
            error={this.props.signupError}
            createUser={this.props.createUser}
          />
        );
      case 2:
        return (
          <div>
            <h1>
              UPLOAD AVATAR - or later
            </h1>
            <ImageUpload
              uploadPending={this.props.uploadPending}
              uploadAvatar={this.props.uploadAvatar}
              uploaded={this.props.uploaded}
            />
            <AccountSettings />
          </div>
        );
      default:
        return <div />;
    }
  }
}
const mapStateToProps = store => {
  const currentStep = store.ui.signupStep ? store.ui.signupStep : 1;
  const intl = store.intl;
  let notUniqueEmail = false;
  let signupError = false;
  if (store.ui.signupError) {
    notUniqueEmail = store.ui.signupError.detail === 'email';
    if (!notUniqueEmail) {
      signupError = true;
    }
  }
  return {
    currentStep,
    notUniqueEmail,
    signupError,
    processing: store.ui.signupProcessing || false,
    uploadPending: store.ui.avatarUploadPending || false,
    uploaded: store.ui.avatarUploaded || false,
    intl, // fix for forceUpdate
  };
};
const mapDispatch = {
  createUser,
  uploadAvatar,
};
export default connect(mapStateToProps, mapDispatch)(SignupContainer);
