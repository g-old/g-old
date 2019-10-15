import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import AvatarEditor from 'react-avatar-editor';

import FormField from '../FormField';
import Box from '../Box';
import FormValidation from '../FormValidation';
import FileUploader from '../Uploader';
import ImageControls from '../ImageUpload/ImageControls';
import CheckBox from '../CheckBox';

const messages = defineMessages({
  image: {
    id: 'label.image',
    defaultMessage: 'Image',
    description: 'Image upload',
  },
});
class Uploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleNext = this.handleNext.bind(this);
    this.onBeforeNextStep = this.onBeforeNextStep.bind(this);
    this.form = React.createRef();
    this.editor = React.createRef();
  }

  componentDidMount() {
    const { callback, stepId } = this.props;
    if (callback) {
      callback(stepId, this.onBeforeNextStep);
    }
  }

  onFilesChanged(data) {
    this.setState({ images: data });
  }

  onBeforeNextStep() {
    if (this.form && this.form.current) {
      const validationResult = this.form.current.enforceValidation([
        'files',
        'cropCoordinates',
        'transferRights',
      ]);
      let cropCoordinates = null;
      let previewImage = null;
      if (this.editor && this.editor.current) {
        cropCoordinates = this.editor.current.getCroppingRect();
        previewImage = this.editor.current.getImage().toDataURL('image/jpeg');
      }

      if (validationResult.isValid) {
        this.handleNext({
          ...validationResult.values,
          cropCoordinates,
          previewImage,
        });
        return true;
      }
    }
    return false;
  }

  handleNext(values) {
    const { onExit } = this.props;
    if (onExit) {
      onExit([
        { name: 'files', value: values.files },
        { name: 'cropCoordinates', value: values.cropCoordinates },
        { name: 'previewImage', value: values.previewImage },
      ]);
    }
  }

  render() {
    const { data } = this.props;
    const { images } = this.state;
    const imageLoaded = images && images.length;
    return (
      <FormValidation
        submit={this.handleNext}
        validations={{
          files: { args: { required: false } },
          cropCoordinates: { args: {} },
          previewImage: { args: {} },
          scale: { args: {} },
          rotation: { args: {} },
          transferRights: { args: { required: true } },
        }}
        data={data}
        ref={this.form}
      >
        {({ handleValueChanges, errorMessages, values }) => (
          <Box column>
            <FormField
              label={<FormattedMessage {...messages.image} />}
              error={errorMessages.filesError}
            >
              <Box fill column>
                <FileUploader
                  files={values.files}
                  onDOMChange={files => {
                    this.onFilesChanged(files);
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
            {imageLoaded && (
              <div>
                <FormField>
                  <Box column align>
                    <AvatarEditor
                      ref={this.editor}
                      image={imageLoaded ? this.state.images[0].preview : null}
                      onSave={this.handleSave}
                      borderRadius={10}
                      border={16}
                      width={256}
                      height={256 / 2.39}
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
                            type: 'uploader',
                            name: 'scale',
                            value: scale,
                          },
                        })
                      }
                    />
                  </Box>
                </FormField>
                <FormField error={errorMessages.transferRightsError}>
                  <CheckBox
                    toggle
                    checked={values.transferRights}
                    label="TOS 2: You grant as a non exclusive transferable, sub-licensable, royalty-free, worldwide license to use your content"
                    name="transferRights"
                    onChange={handleValueChanges}
                  />
                </FormField>
              </div>
            )}
          </Box>
        )}
      </FormValidation>
    );
  }
}

Uploader.propTypes = {
  callback: PropTypes.func.isRequired,
  stepId: PropTypes.string.isRequired,
  onExit: PropTypes.func.isRequired,
  data: PropTypes.shape({}).isRequired,
};

export default Uploader;
