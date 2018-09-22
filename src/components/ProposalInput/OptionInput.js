import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../FormField';
import Button from '../Button';
import PollOption from '../PollOption';

class OptionInput extends React.Component {
  propTypes = {
    onAddOption: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleAddOption() {
    const { onAddOption } = this.props;
    const { description } = this.state;
    if (description) {
      onAddOption({ description });
      this.setState({ description: '' });
    }
  }

  handleInputChange(e) {
    this.setState({ description: e.target.value });
  }

  render() {
    const { options } = this.props;
    const { description } = this.state;
    return (
      <div>
        {'OptionInput'}
        {options && options.map(o => <PollOption {...o} />)}
        <FormField description>
          <input
            value={description}
            name="option"
            type="text"
            onChange={this.handleInputChange}
          />
        </FormField>
        <Button onClick={this.handleAddOption} label="Add" />
      </div>
    );
  }
}

export default OptionInput;
