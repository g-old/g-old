import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './WorkTeamInput.css';
import SearchField from '../SearchField';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import {
  nameValidation,
  selectValidation,
  createValidator,
} from '../../core/validation';

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
const formFields = ['teamName', 'coordinator'];
class WorkTeamInput extends React.Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    findUser: PropTypes.func.isRequired,
    createWorkTeam: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.state = {
      teamName: '',
      errors: {
        teamName: {
          touched: false,
        },
        coordinator: {
          touched: false,
        },
      },
    };
    const testValues = {
      teamName: { fn: 'name' },

      coordinator: {
        fn: 'coordinator',
        valuesResolver: obj => obj.state.coordinatorValue,
      },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
        coordinator: selectValidation,
      },
      this,
      obj => obj.state,
    );
  }

  onSubmit() {
    if (this.handleValidation(formFields)) {
      const { createWorkTeam } = this.props;
      const { coordinator, teamName } = this.state;
      const coordinatorId = coordinator ? coordinator.id : undefined;
      createWorkTeam({ coordinatorId, name: teamName });
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
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
  }

  openLogoUploader() {
    this.setState({ showLogoUploader: true });
  }

  render() {
    const langs = [
      { code: 'de', name: 'german' },
      { code: 'it', name: 'italian' },
      { code: 'lld', name: 'ladin' },
    ];
    const { teamName } = this.state;
    const { teamNameError, coordinatorError } = this.visibleErrors(formFields);
    return (
      //  <Layer onClose={this.props.onClose}>
      <Box justify>
        <Box pad column className={s.form}>
          <h1>Create Team</h1>

          <fieldset>
            <FormField label="Teamname" error={teamNameError}>
              <input
                name="teamName"
                onBlur={this.handleBlur}
                type="text"
                value={teamName}
                onChange={this.handleValueChanges}
              />
            </FormField>

            {langs.map(language => (
              <FormField label={`Teamname${language.name}`}>
                <input
                  name={`teamName${language.code}`}
                  onBlur={this.handleBlur}
                  type="text"
                  value={this.state[`teamName${language.code}`]}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            ))}

            <FormField overflow label="Coordinator" error={coordinatorError}>
              <SearchField
                onChange={e =>
                  this.handleValueChanges({
                    target: { name: 'coordinatorValue', value: e.value },
                  })
                }
                data={this.props.users}
                fetch={this.props.findUser}
                displaySelected={data => {
                  this.handleValueChanges({
                    target: { name: 'coordinator', value: data },
                  });
                }}
              />
            </FormField>
            <FormField label="Logo" />
            <FormField label="Background">
              <input type="file" />
            </FormField>
          </fieldset>
          <Button primary fill label="Create Team" onClick={this.onSubmit} />
        </Box>
      </Box>
      // </Layer>
    );
  }
}

export default withStyles(s)(WorkTeamInput);
