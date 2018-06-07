import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createValidator } from '../../core/validation';

const createMinLengthValidation = length => value => {
  if (value.length >= length) {
    return { touched: false };
  }
  return { touched: true, errorName: 'min', args: length };
};
const createMaxLengthValidation = length => value => {
  if (value.length <= length) {
    return { touched: false };
  }
  return { touched: true, errorName: 'max', args: length };
};

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
  min: {
    id: 'form.error-min',
    defaultMessage: 'Enter atleast {value} chars or numbers',
    description: 'Min',
  },
  invalidEmail: {
    id: 'form.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  emailTaken: {
    id: 'form.error-emailTaken',
    defaultMessage: 'Email address already in use',
    description: 'Help for not unique email',
  },
});

const genInitialState = (fields, values) =>
  fields.reduce(
    (acc, curr) => {
      acc[curr] = values[curr] || '';
      acc.errors[curr] = { touched: false };
      return acc;
    },
    { errors: {} },
  );

const genValidateFn = ({ fn, args = {} }) => {
  const allFns = [];
  if (fn) {
    allFns.push(fn);
  }
  if (args.min) {
    allFns.push(createMinLengthValidation(args.min));
  }
  if (args.max) {
    allFns.push(createMaxLengthValidation(args.max));
  }
  return (value, state, options) => {
    /* breaks after it found an error */
    let error;

    if (value) {
      for (let i = 0; i < allFns.length; i += 1) {
        error = allFns[i](value, state, options);
        if (error.touched) {
          break;
        }
      }
    } else if (args.required) {
      error = { touched: true, errorName: 'empty' };
    }

    return error || { touched: false };
  };
};

const getChangedFields = (inputFields, state, props) =>
  inputFields.reduce((agg, field) => {
    if (field in state) {
      if (field in props) {
        if (state[field] !== props[field]) {
          agg[field] = state[field]; // eslint-disable-line
        }
        // get only fields with values
      } else if (state[field]) {
        agg[field] = state[field]; // eslint-disable-line
      }
      // only in state
    }
    return agg;
  }, {});

class FormValidation extends React.Component {
  static propTypes = {
    validations: PropTypes.arrayOf(
      PropTypes.shape({
        fn: PropTypes.func,
        valuesResolver: PropTypes.func,
        args: PropTypes.shape({}),
      }),
    ).isRequired,
    data: PropTypes.shape({}),
    submit: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    names: PropTypes.shape({}),
  };
  static defaultProps = { data: null, names: null };

  constructor(props) {
    super(props);
    this.formFields = Object.keys(props.validations);
    this.state = {
      ...genInitialState(this.formFields, {
        ...(props.data && props.data),
        ...(props.names && { ...props.names }),
      }),
    };
    const validationMappings = Object.keys(props.validations).reduce(
      (acc, fieldName) => {
        let key;
        if (props.validations[fieldName].fn) {
          key = props.validations[fieldName].fn.name;
        } else {
          key = fieldName;
        }
        acc[key] = genValidateFn(props.validations[fieldName]);
        return acc;
      },
      {},
    );

    const allValues = Object.keys(props.validations).reduce(
      (acc, fieldName) => {
        let key;
        if (props.validations[fieldName].fn) {
          key = props.validations[fieldName].fn.name;
        } else {
          key = fieldName;
        }
        acc[fieldName] = {
          fn: key,
          ...(props.validations[fieldName].valuesResolver && {
            valuesResolver: props.validations[fieldName].valuesResolver,
          }),
        };
        return acc;
      },
      {},
    );

    this.Validator = createValidator(
      allValues,
      validationMappings,
      this,
      obj => obj.state,
    );

    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.validate = this.validate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentWillReceiveProps({ data }) {
    if (data !== this.props.data) {
      const newState = {
        ...genInitialState(this.formFields, {
          ...this.state,
          ...(data && data),
          ...(data.names && { ...data.names }),
        }),
      };
      this.setState(newState);
    }
  }

  onSubmit(e, options) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.validate(this.formFields)) {
      const newValues = getChangedFields(
        this.formFields,
        this.state,
        this.props.data || {},
      );
      if (this.props.submit) {
        this.props.submit(newValues, this.state, options);
      }
    }
  }

  handleBlur(e) {
    const field = e.target.name;
    if (this.state[field]) {
      this.validate([field]);
    }
  }

  validate(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }

  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      const fieldStatus = this.state.errors[curr];
      if (fieldStatus.touched) {
        acc[err] = (
          <FormattedMessage
            {...messages[fieldStatus.errorName]}
            values={{ value: fieldStatus.args }}
          />
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
      value = e.target.value; //eslint-disable-line
    }
    this.setState({ [e.target.name]: value });
  }

  renderChildren() {
    const fields = getChangedFields(
      this.formFields,
      this.state,
      this.props.data || {},
    );

    const inputChanged = Object.keys(fields).length > 0;

    return this.props.children({
      validate: this.handleValidate,
      errorMessages: this.visibleErrors(this.formFields),
      allValid: this.state.allValid,
      values: this.state,
      handleValueChanges: this.handleValueChanges,
      onSubmit: this.onSubmit,
      onBlur: this.handleBlur,
      inputChanged,
    });
  }
  render() {
    return this.renderChildren();
  }
}

export default FormValidation;
