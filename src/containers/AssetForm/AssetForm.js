import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { createAsset } from '../../actions/asset';
import { findUser } from '../../actions/user';

import {
  getGroup,
  getVisibleUsers,
  getGroupStatus,
  getSessionUser,
} from '../../reducers';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import Label from '../../components/Label';
import Form from '../../components/Form';
import FormValidation from '../../components/FormValidation';
import Uploader from '../../components/Uploader';

import history from '../../history';

import Notification from '../../components/Notification';

// TODO EDIT + CREATE should be the same form
class AssetForm extends React.Component {
  static propTypes = {
    createAsset: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
  };

  static defaultProps = {
    updates: null,
  };
  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
    this.handleFormSubmission = this.handleFormSubmission.bind(this);
    this.state = {};
  }

  // eslint-disable-next-line
  onCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    history.push(`/admin`);
  }

  handleFormSubmission(values) {
    // check coordinator
    /* eslint-disable no-param-reassign */

    /* eslint-enable no-param-reassign */
    this.props.createAsset(values.file, { filename: values.filename });
  }

  render() {
    const { error } = this.state;
    const { updates = {} } = this.props;
    /* let imagesUpload = (
      <ImageUpload
        uploadImage={this.uploadImage}
        uploadError={fileUpdates.error}
        uploadPending={fileUpdates.pending}
        ratio={this.state.ratio}
        serverResizing
        onClose={this.onLayerClose}
      />
    ); */
    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <FormValidation
            submit={this.handleFormSubmission}
            validations={{
              filename: { args: { min: 3 } },
              file: { args: { required: true } },
            }}
          >
            {({
              handleValueChanges,
              values,
              errorMessages,
              onSubmit,
              onBlur,
            }) => (
              <Form>
                <Label>Asset</Label>
                <FormField>
                  <Uploader
                    label="Click or drop"
                    fullDropTarget
                    uploadPending={updates.pending}
                    onDOMChange={data => {
                      if (data.length) {
                        handleValueChanges({
                          target: { name: 'filename', value: data[0].name },
                        });
                      }
                      handleValueChanges({
                        target: {
                          name: 'file',
                          value: data[0],
                        },
                      });
                    }}
                  />
                </FormField>

                <FormField label="Filename" error={errorMessages.filenameError}>
                  <input
                    type="text"
                    name="filename"
                    value={values.filename}
                    onChange={handleValueChanges}
                    onBlur={onBlur}
                  />
                </FormField>

                <p>
                  {error && (
                    <Notification type="error" message={updates.error} />
                  )}
                </p>
                <div>
                  <Button
                    disabled={updates.pending}
                    onClick={onSubmit}
                    primary
                    label="Save"
                  />
                  <Button label="Cancel" onClick={this.onCancel} />
                </div>
              </Form>
            )}
          </FormValidation>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  group: getGroup(state, id),
  users: getVisibleUsers(state, 'all'),
  updates: getGroupStatus(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  findUser,
  createAsset,
};

export default connect(mapStateToProps, mapDispatch)(AssetForm);
