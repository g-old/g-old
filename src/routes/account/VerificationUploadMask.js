// @flow
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import Button from '../../components/Button';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import FormValidation from '../../components/FormValidation';
import FileUploader from '../../components/Uploader';
import Heading from '../../components/Heading';
import Notification from '../../components/Notification/Notification';
import Spinner from '../../components/Spinner/Spinner';

const messages = defineMessages({
  image: {
    id: 'label.image',
    defaultMessage: 'Image',
    description: 'Image upload',
  },
  verificationHelp: {
    id: 'help.verification',
    defaultMessage:
      'Please upload a photo of your Identitycard where your name, surname and id-number are clearly visible',
    description: 'Helptext for verification file upload',
  },
  click: {
    id: 'command.click',
    defaultMessage: 'Click here',
    description: 'Click command',
  },
  submit: {
    id: 'command.submit',
    defaultMessage: 'Submit',
    description: 'Short command for sending data to the server',
  },
  verification: {
    id: 'label.verification',
    defaultMessage: 'Verification',
    description: 'Verification',
  },
  error: {
    id: 'label.error',
    defaultMessage: 'An error occured',
    description: 'Unspecific error message',
  },
});

type Props = {
  upload: () => void,
  update: () => void,
  userId: ID,
  error?: string,
  pending?: boolean,
};
type State = {};

class VerificationUploadMask extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {};
    this.form = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const { files } = values;
    if (!files[0]) {
      return;
    }
    const image = new Image();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    image.src = files[0].preview;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    const data = canvas.toDataURL('image/jpeg', 0.4);

    this.props
      .upload([data], { private: true, verification: true })
      .then(result => {
        if (result) {
          this.props.update({
            verification: { filePath: result },
            id: this.props.userId,
          });
        } else {
          this.setState({ uploadError: true });
        }
      });
  }

  render() {
    const { pending, error } = this.props;
    const { uploadError } = this.state;
    const hasError = uploadError || error;
    return (
      <FormValidation
        submit={this.handleSubmit}
        validations={{
          files: { args: { required: true } },
        }}
        ref={this.form}
      >
        {({
          handleValueChanges,
          errorMessages,
          values,
          onSubmit,
          inputChanged,
        }) => (
          <Box align padding="medium" column>
            <Heading tag="h2">
              <FormattedMessage {...messages.verification} />
            </Heading>
            {hasError && (
              <Notification
                message={<FormattedMessage {...messages.error} />}
              />
            )}
            <FormField
              help={<FormattedMessage {...messages.verificationHelp} />}
              label={<FormattedMessage {...messages.image} />}
              error={errorMessages.filesError}
            >
              <Box fill column>
                <FileUploader
                  label={<FormattedMessage {...messages.click} />}
                  files={values.files}
                  onDOMChange={files => {
                    handleValueChanges({
                      target: {
                        type: 'uploader',
                        name: 'files',
                        value: files,
                      },
                    });
                  }}
                />
              </Box>
            </FormField>
            {!hasError && inputChanged && (
              <Button disabled={pending} primary onClick={onSubmit}>
                <FormattedMessage {...messages.submit} />
              </Button>
            )}
            {pending && <Spinner />}
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default VerificationUploadMask;
