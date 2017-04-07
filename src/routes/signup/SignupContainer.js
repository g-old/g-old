import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SignUp from '../../components/SignUp';
import AccountSettings from '../../components/AccountSettings';
import { createUser } from '../../actions/user';

class SignupContainer extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
    signupError: PropTypes.bool,
    notUniqueEmail: PropTypes.bool,
    processing: PropTypes.bool,
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
        return <AccountSettings />;
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
    intl, // fix for forceUpdate
  };
};
const mapDispatch = {
  createUser,
};
export default connect(mapStateToProps, mapDispatch)(SignupContainer);
