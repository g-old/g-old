import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Message.css';
import Label from '../Label';
import Box from '../Box';
import UserThumbnail from '../UserThumbnail';

class Message extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    msg: PropTypes.string.isRequired,
    sender: PropTypes.shape({}).isRequired,
  };

  render() {
    const { title, msg, sender } = this.props;
    return (
      <Box column className={s.root} pad>
        <Label>{title}</Label>
        <div>{msg}</div>
        <UserThumbnail user={sender} />
      </Box>
    );
  }
}

export default withStyles(s)(Message);
