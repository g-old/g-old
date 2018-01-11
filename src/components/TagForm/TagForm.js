import React from 'react';
import PropTypes from 'prop-types';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import Label from '../Label';
import Form from '../Form';

import { nameValidation, createValidator } from '../../core/validation';
import Notification from '../../components/Notification';

const messages = defineMessages({
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  wrongSelect: {
    id: 'form.error-select',
    defaultMessage: 'You selection is not correct. Click on a suggestion',
    description:
      'Help for selection, when input does not match with a suggestion',
  },
});

// import FetchError from '../../components/FetchError';

const getChangedFields = (inputFields, state, props) =>
  inputFields.reduce((agg, curr) => {
    if (curr in state) {
      if (curr in props) {
        if (state[curr] !== props[curr]) {
          agg[curr] = state[curr]; // eslint-disable-line
        }
      } else {
        agg[curr] = state[curr]; // eslint-disable-line
      }
      // only in state
    }
    return agg;
  }, {});

const formFields = ['text'];
// TODO Form HOC
const genInitalState = (fields, values) =>
  fields.reduce(
    (acc, curr) => {
      acc[curr] = values[curr] || '';
      acc.errors[curr] = { touched: false };
      return acc;
    },
    { errors: {} },
  );

// TODO EDIT + CREATE should be the same form
class TagForm extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    tag: PropTypes.shape({ id: PropTypes.string }).isRequired,
    user: PropTypes.shape({ id: PropTypes.string }).isRequired,
    findUser: PropTypes.func.isRequired,
    updateTag: PropTypes.func.isRequired,
    createTag: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
    onCancel: PropTypes.func.isRequired,
  };

  static defaultProps = {
    updates: null,
  };
  constructor(props) {
    super(props);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      ...props.tag,
      ...genInitalState(formFields, props.tag),
      /*  error: null,
      pending: false,
      success: false, */
    };
    const testValues = {
      text: { fn: 'name' },
      deName: { fn: 'name' },
      itName: { fn: 'name' },
      lldName: { fn: 'name' },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
        noCheck: () => {},
      },
      this,
      obj => obj.state,
    );
  }

  componentWillReceiveProps({ tag, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }

    this.setState({ ...tag, ...newUpdates });
  }

  // eslint-disable-next-line
  onCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.props.onCancel();
  }

  onSubmit(e) {
    // TODO checks
    e.preventDefault();
    const { tag } = this.props;
    // sTODO implement auth
    if (this.handleValidation(formFields)) {
      const inputFields = ['deName', 'itName', 'lldName', 'text'];
      const inputValues = getChangedFields(
        inputFields,
        this.state,
        this.props.tag,
      );
      // check coordinator
      if (tag.id) {
        this.props.updateTag({ id: this.state.id, ...inputValues });
      } else {
        this.props.createTag({ ...inputValues });
      }
    }
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }

  handleBlur(e) {
    const field = e.target.name;
    if (this.state[field]) {
      this.handleValidation([field]);
    }
  }
  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
      }
      return acc;
    }, {});
  }
  handleValueChanges(e) {
    let value;
    if (e.target.type === 'checkbox') {
      value = !this.state[e.target.name];
    } else {
      value = e.target.value;
    }

    this.setState({ [e.target.name]: value });
  }

  render() {
    const { lldName, text, deName, itName, error } = this.state;
    const { updates = {} } = this.props;
    const errors = this.visibleErrors(formFields);

    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <Form onSubmit={this.onSubmit}>
            <Label>{'Tag names'}</Label>
            <fieldset>
              <FormField label="Default name" error={errors.textError}>
                <input
                  type="text"
                  name="text"
                  value={text}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name german">
                <input
                  type="text"
                  name="deName"
                  value={deName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name italian">
                <input
                  type="text"
                  name="itName"
                  value={itName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name ladin">
                <input
                  type="text"
                  name="lldName"
                  value={lldName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            </fieldset>

            <p>
              {error && <Notification type="error" message={updates.error} />}
            </p>
            <div>
              <Button disabled={updates.pending} primary label="Save" />{' '}
              <Button label="Cancel" onClick={this.onCancel} />
            </div>
          </Form>
        </Box>
      </Box>
    );
  }
}

export default TagForm;
