/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollOption.css';
import Box from '../Box';
import CheckBox from '../CheckBox';

type PollOptionProps = {
  description: string,
  onChange: () => void,
  checked: boolean,
  disabled: boolean,
  numVotes: number,
  pos: number,
};

class PollOption extends React.Component<PollOptionProps> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange: () => void;

  handleChange() {
    const { pos, onChange } = this.props;
    if (onChange) {
      onChange({ pos });
    }
  }

  render() {
    const { description, checked, disabled, numVotes } = this.props;
    return (
      <Box>
        <CheckBox
          checked={checked}
          disabled={disabled}
          onChange={this.handleChange}
          label={description}
        />
        NumVotes: {numVotes}
      </Box>
    );
  }
}

export default withStyles(s)(PollOption);
