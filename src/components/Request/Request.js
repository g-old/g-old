import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Request.css';
import Box from '../Box';
import ProfilePicture from '../ProfilePicture';
import Label from '../Label';
import Button from '../Button';
import Notification from '../Notification';

class Request extends React.Component {
  static propTypes = {
    requester: PropTypes.shape({}).isRequired,
    onCancel: PropTypes.func.isRequired,
    onAllow: PropTypes.func.isRequired,
    onDeny: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
  };

  static defaultProps = { updates: null };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps({ workTeam, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      // h istory.push(`/workteams/${this.props.workteamId}/admin`);
      this.props.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }

    this.setState({ ...workTeam, ...newUpdates });
  }

  render() {
    const { requester, onCancel, onAllow, onDeny, updates = {} } = this.props;
    return (
      <Box wrap justify align padding="medium">
        <Box column align padding="small">
          <Label>{`${requester.name} ${requester.surname}`}</Label>
          <ProfilePicture user={requester} />
        </Box>
        {this.state.error && (
          <p>
            <Notification type="error" message={updates.error} />
          </p>
        )}
        <Box column pad>
          <Button onClick={onAllow} label="Allow" />
          <Button onClick={onDeny} label="Deny" />
          <Button primary onClick={onCancel} label="Cancel" />
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(Request);
