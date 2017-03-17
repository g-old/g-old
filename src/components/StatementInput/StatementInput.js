import React, { PropTypes } from 'react';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import s from './StatementInput.css';


class StatementInput extends React.Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: '' },
    };
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    // this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
  }
  handleTextAreaChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }
  handleOnSubmit(e) {
    const data = { text: this.state.textArea.val };
    this.props.onSubmit(data);
    e.preventDefault();
  }

  render() {
    return (
      <div>
        {'Text'}
        <br />
        <textarea
          value={this.state.textArea.val}
          onChange={this.handleTextAreaChange}
        />
        <button onClick={this.handleOnSubmit}> ABSCHICKEN </button>
      </div>
    );
  }
}

export default StatementInput;
