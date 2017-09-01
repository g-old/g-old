import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { getAccountUpdates } from '../../reducers';
import { verifyEmail } from '../../actions/verifyEmail';
import Button from '../../components/Button';
import Box from '../../components/Box';
import Notification from '../../components/Notification';

class EmailVerification extends React.Component {
  static propTypes = {
    updates: PropTypes.shape({}).isRequired,
    verifyEmail: PropTypes.func.isRequired,
  };

  render() {
    const { updates } = this.props;
    // const verifyError = updates && updates.verifyEmail && updates.verifyEmail.error;
    const verifyPending =
      updates && updates.verifyEmail && updates.verifyEmail.pending;
    const verifySuccess =
      updates && updates.verifyEmail && updates.verifyEmail.success;
    let content = null;
    if (verifySuccess) {
      content =
        'Wait a few minutes, then look in your mail inbox or spam ordner for the email with the confirmation link';
    } else {
      content = (
        <Notification
          type="error"
          message={
            'Could not verify your email. The link is expired or invalid.'
          }
          action={
            <Button
              primary
              label={'Send new link'}
              disabled={verifyPending}
              onClick={this.props.verifyEmail}
            />
          }
        />
      );
    }
    return (
      <Box column pad>
        {content}
      </Box>
    );
  }
}

const mapStateToProps = (state, { user }) => ({
  updates: getAccountUpdates(state, user.id),
});

const mapDispatch = {
  verifyEmail,
};

export default connect(mapStateToProps, mapDispatch)(EmailVerification);
