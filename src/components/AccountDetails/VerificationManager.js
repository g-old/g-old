// @flow
import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import ImageControls from '../ImageUpload/ImageControls';
import Box from '../Box/Box';
import FormValidation from '../FormValidation/FormValidation';
import FormField from '../FormField/FormField';
import Image from '../Image/Image';
import UserThumbnail from '../UserThumbnail/UserThumbnail';
import Button from '../Button/Button';
import CheckBox from '../CheckBox/CheckBox';
import Label from '../Label/Label';
import { Symbols } from '../ProposalsManager/ProposalRow';

const messages = defineMessages({
  denied: {
    id: 'label.denied',
    defaultMessage: 'Denied',
    description: 'Label denied',
  },
  confirmed: {
    id: 'label.confirmed',
    defaultMessage: 'Confirmed',
    description: 'Label confirmed',
  },
  pending: {
    id: 'label.pending',
    defaultMessage: 'Pending',
    description: 'Label pending',
  },
  submit: {
    id: 'command.submit',
    defaultMessage: 'Submit',
    description: 'Short command for sending data to the server',
  },
});

type Props = {
  user: Usershape,
  onSubmit: () => void,
  isAdult: boolean,
  livesHere: boolean,
};

class VerificationManager extends React.Component<Props> {
  render() {
    const { user, onSubmit: submit, isAdult, livesHere } = this.props;

    return (
      <FormValidation
        submit={submit}
        validations={{
          status: {},
          scale: {},
          rotation: {},
          isAdult: {},
          livesHere: {},
        }}
        data={{
          status: user.verificationStatus,
          scale: 1,
          rotation: 0.000000001, // dumb hack for inputchanged
          isAdult,
          livesHere,
        }}
      >
        {({ onSubmit, handleValueChanges, values, inputChanged }) => (
          <Box column>
            <FormField label="Account">
              <UserThumbnail user={user} />
            </FormField>
            {user.verification.verificator && (
              <FormField label="verified by">
                <UserThumbnail user={user.verification.verificator} />
              </FormField>
            )}
            {user.verification.filePath && (
              <FormField label="File">
                <Box column align>
                  <AvatarEditor
                    image={
                      /* imageLoaded ? this.state.images[0].preview : null */

                      user.verification.filePath
                    }
                    width={300}
                    height={300}
                    borderRadius={10}
                    border={0}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={values.scale}
                    rotate={values.rotation}
                    onLoadFailure={() =>
                      alert('Image could not been loaded -> load another one')
                    }
                  />
                  <ImageControls
                    scale={values.scale}
                    rotation={values.rotation}
                    disabled={false}
                    onScaleChanged={scale =>
                      handleValueChanges({
                        target: {
                          type: 'viewer',
                          name: 'scale',
                          value: scale,
                        },
                      })
                    }
                    onRotationChanged={rotation =>
                      handleValueChanges({
                        target: {
                          type: 'viewer',
                          name: 'rotation',
                          value: rotation,
                        },
                      })
                    }
                  />
                </Box>
                <Image fit src={user.verification.filePath} />
              </FormField>
            )}
            <FormField label="CurrentStatus">
              <Label>{values.status}</Label>
            </FormField>
            {/*! verificationPending && (
              <FormField label="Status">
                <Select
                  inField
                  options={[
                    {
                      value: VerificationTypes.DENIED,
                      label: intl.formatMessage(messages.denied),
                    },
                    {
                      value: VerificationTypes.CONFIRMED,
                      label: intl.formatMessage(messages.confirmed),
                    },
                  ]}
                  onSearch={false}
                  value={values.status || data.status}
                  onChange={e => {
                    handleValueChanges({
                      target: { name: 'status', value: e.value },
                    });
                  }}
                />
              </FormField>
                ) */}
            <fieldset>
              <FormField help="If this requirement is not given, the verification will be denied">
                <CheckBox
                  label="Is adult?"
                  checked={values.isAdult}
                  onChange={handleValueChanges}
                  name="isAdult"
                />
              </FormField>
              <FormField help="If this requirement is not given, the verification will be denied">
                <CheckBox
                  label="Lives here?"
                  checked={values.livesHere}
                  name="livesHere"
                  onChange={handleValueChanges}
                />
              </FormField>
            </fieldset>
            {inputChanged && (
              <Box align>
                <Label>New Status:</Label>
                <Label>
                  <FormattedMessage
                    {...messages[
                      values.isAdult && values.livesHere
                        ? 'confirmed'
                        : 'denied'
                    ]}
                  />
                </Label>
                {
                  Symbols[
                    values.isAdult && values.livesHere ? 'approved' : 'denied'
                  ]
                }
              </Box>
            )}
            {/* inputChanged does not work atm */}
            {inputChanged && (
              <Box>
                <Button
                  primary
                  onClick={onSubmit}
                  label={<FormattedMessage {...messages.submit} />}
                />
              </Box>
            )}
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default injectIntl(VerificationManager);
