import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import s from './Message.css';
import Label from '../Label';
import Box from '../Box';
import UserThumbnail from '../UserThumbnail';
import FormValidation from '../FormValidation';
import Button from '../Button';

const messages = defineMessages({
  send: {
    id: 'command.submit',
    description: 'Short command for sending data to the server',
    defaultMessage: 'Submit',
  },

  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
});
class Message extends React.Component {
  static propTypes = {
    subject: PropTypes.string.isRequired,
    sender: PropTypes.shape({}).isRequired,
    content: PropTypes.string.isRequired,
    replyable: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onReply: PropTypes.func.isRequired,
    updates: PropTypes.shape({}).isRequired,
    parents: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    replyable: null,
    parents: null,
  };
  constructor(props) {
    super(props);
    this.sendReply = this.sendReply.bind(this);
  }

  sendReply(values) {
    const { subject, id, sender } = this.props;
    this.props.onReply({
      parentId: id,
      recipientType: 'USER',
      messageType: 'COMMUNICATION',
      recipients: [sender.id],
      subject: { de: `Re: ${subject}` },
      communication: {
        textHtml: values.text,
        replyable: true,
      },
    });
  }

  render() {
    const {
      subject,
      content,
      sender,
      replyable,
      updates,
      parents,
    } = this.props;
    return (
      <Box column pad>
        {parents &&
          parents.map(m => (
            <Box between className={s.root}>
              <UserThumbnail user={m.sender} />
              <FormattedRelative value={m.createdAt} />
            </Box>
          ))}
        <Box column className={s.root} pad>
          <Label>{subject}</Label>
          <div dangerouslySetInnerHTML={{ __html: content }} />

          <UserThumbnail user={sender} />
          {replyable && (
            <FormValidation
              submit={this.sendReply}
              validations={{ text: { args: { required: true } } }}
              data={{ text: '' }}
            >
              {({ values, onSubmit, handleValueChanges }) => (
                <Box column>
                  <Textarea
                    disabled={updates.pending}
                    name="text"
                    useCacheForDOMMeasurements
                    placeholder="Not working"
                    value={values.text}
                    onChange={handleValueChanges}
                    minRows={2}
                  />
                  <Button
                    primary
                    disabled={updates.pending}
                    onClick={onSubmit}
                    label={<FormattedMessage {...messages.send} />}
                  />
                </Box>
              )}
            </FormValidation>
          )}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(Message);
