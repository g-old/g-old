import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import s from './Message.css';
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
    parentId: PropTypes.string.isRequired,
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
    const { subject, sender, parentId } = this.props;
    this.props.onReply({
      parentId,
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
    const { subject, content, sender, updates, replyable } = this.props;
    return (
      <Box column className={s.root}>
        <div className={s.subject}>
          <span>{subject}</span>
        </div>
        <div
          className={s.content}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className={s.content}>
          <UserThumbnail user={sender} />
        </div>
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
    );
  }
}

export default withStyles(s)(Message);
