import React, { PropTypes } from 'react';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import s from './StatementInput.css';

class StatementInput extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    statementId: PropTypes.string,
    showOwnStatement: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      textArea: { val: this.props.text || '' },
    };
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    // this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
  }

  handleTextAreaChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }
  handleOnSubmit(e) {
    const text = this.state.textArea.val.trim();
    if (text) {
      // TODO validation
      // TODO refactor the edit-cyle
      this.props.onSubmit({ id: this.props.statementId, text }, this.props.text != null);
    }

    if (this.props.showOwnStatement) {
      this.props.showOwnStatement();
    }
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <textarea value={this.state.textArea.val} onChange={this.handleTextAreaChange} />
        <button onClick={this.handleOnSubmit}> ABSCHICKEN </button>
        {this.props.text && <button onClick={this.props.showOwnStatement}>CANCEL</button>}
      </div>
    );
  }
}

export default StatementInput;
