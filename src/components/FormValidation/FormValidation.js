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
  shortPassword: {
    id: 'form.error-shortPassword',
    defaultMessage:
      'Short passwords are easy to guess. Try one with at least 6 characters ',
    description: 'Help for short passwords',
  },
  passwordMismatch: {
    id: 'form.error-passwordMismatch',
    defaultMessage: "These passwords don't match. Try again?",
    description: 'Help for mismatching passwords',
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
    lazy: PropTypes.boolean,
    eager: PropTypes.boolean,
    onBlur: PropTypes.func,
    options: PropTypes.shape({}),
  };

  static defaultProps = {
    data: null,
    names: null,
    lazy: null,
    eager: null,
    onBlur: null,
    options: null,
  };

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
          key = props.validations[fieldName].fn.name || `${fieldName}fn`;
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
          key = props.validations[fieldName].fn.name || `${fieldName}fn`;
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
    this.enforceValidation = this.enforceValidation.bind(this);
  }

  componentWillReceiveProps({ data, options }) {
    let newState = {};
    if (
      (data && data !== this.props.data) ||
      (options && options !== this.props.options)
    ) {
      newState = {
        ...genInitialState(this.formFields, {
          ...this.state,
          ...(data && data),
          ...(data && data.names && { ...data.names }),
        }),
      };
      if (options && options !== this.props.options) {
        newState = { ...newState, ...options };
      }
      this.setState(newState);
    }
  }

  onSubmit(e, options) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let fields = this.formFields;
    if (options && options.excludeFields && options.excludeFields.length) {
      fields = fields.filter(field => !options.excludeFields.includes(field));
    }
    const validationResult = this.validate(fields);
    const newState = {
      errors: { ...this.state.errors, ...validationResult.errors },
    };
    if (validationResult.failed === 0 || this.props.lazy) {
      this.setState(newState, () => {
        const newValues = getChangedFields(
          this.formFields,
          this.state,
          this.props.data || {},
        );
        if (this.props.submit) {
          this.props.submit(newValues, this.state, options);
        }
      });
    } else {
      this.setState(newState);
    }
  }

  handleBlur(e) {
    const field = e.target.name;
    const fields = [];

    if (this.state[field]) {
      fields.push(field);
      if (this.props.onBlur) {
        this.props.onBlur(field, this.state, fields);
      }
      const validationResult = this.validate(fields);
      this.setState({
        errors: { ...this.state.errors, ...validationResult.errors },
      });
    }
  }

  validate(fields) {
    return this.Validator(fields);
  }

  enforceValidation(fields, options) {
    const validate = () => {
      const validationResult = this.validate(fields);
      const newState = {
        errors: { ...this.state.errors, ...validationResult.errors },
      };
      this.setState(newState);
    };
    if (options) {
      this.setState({ ...options }, validate);
    } else {
      validate();
    }
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
    const field = e.target.name;
    if (this.props.eager) {
      if (this.state.errors[field].touched) {
        this.setState({
          errors: {
            ...this.state.errors,
            [field]: { ...this.state.errors[field], touched: false },
          },
        });
      }
    }
    this.setState({ [field]: value });
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
