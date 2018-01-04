import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Request.css';
import Box from '../Box';
import ProfilePicture from '../ProfilePicture';
import Label from '../Label';
import Button from '../Button';

class Request extends React.Component {
  static propTypes = {
    requester: PropTypes.shape({}).isRequired,
    onCancel: PropTypes.func.isRequired,
    onAllow: PropTypes.func.isRequired,
  };
  static defaultProps = {};

  render() {
    const { requester, onCancel, onAllow } = this.props;
    return (
      <Box wrap justify align>
        <ProfilePicture user={requester} />
        <Label>{`${requester.name} ${requester.surname}`}</Label>
        <Button onClick={onAllow} label={'Allow'} primary />
        <Button onClick={onCancel} label={'Cancel'} />
      </Box>
    );
  }
}

export default withStyles(s)(Request);
