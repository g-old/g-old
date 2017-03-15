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
      textInput: { val: '' },
      textArea: { val: '' },
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    // this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
  }
  handleInputChange(e) {
    this.setState({ ...this.state, textInput: { val: e.target.value } });
  }
  handleTextAreaChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }
  handleOnSubmit(e) {
    const data = { title: this.state.textInput.val, text: this.state.textArea.val };
    this.props.onSubmit(data);
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <p>
          {'Title'}
          <br />
          <input
            type="text"
            value={this.state.textInput.val}
            onChange={this.handleInputChange}
          />
        </p>
        <p>
          {'Text'}
          <br />
          <textarea
            value={this.state.textArea.val}
            onChange={this.handleTextAreaChange}
          />
        </p>
        <button onClick={this.handleOnSubmit}> ABSCHICKEN </button>
      </div>
    );
  }
}

export default StatementInput;
