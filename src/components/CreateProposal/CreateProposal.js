import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createProposal } from '../../actions/proposal';

class CreateProposal extends React.Component {
  static propTypes = {
    createProposal: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = { textArea: { val: '' }, title: { val: '' }, value: 1 };
    this.onTextChange = this.onTextChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
  }
  onTextChange(e) {
    this.setState({ ...this.state, textArea: { val: e.target.value } });
  }
  onTitleChange(e) {
    this.setState({ ...this.state, title: { val: e.target.value } });
  }
  onModeChange(e) {
    this.setState({ ...this.state, value: e.target.value });
  }
  onSubmit() {
    // TODO validate
    const title = this.state.title.val.trim();
    const text = this.state.textArea.val.trim();
    if (title && text) {
      this.props.createProposal({ title, text, pollingModeId: this.state.value });
    }
  }
  render() {
    return (
      <div>

        <select value={this.state.value} onChange={this.onModeChange}>
          <option value={1}>TR: 20 UNIPOLAR: 1 NOSTATEMENTS </option>
        </select>
        <br />
        TITLE <input type="text" onChange={this.onTitleChange} />
        <p>
          <textarea
            placeholder="Enter proposal"
            value={this.state.textArea.val}
            onChange={this.onTextChange}
          />
        </p>
        <button onClick={this.onSubmit}> SUBMIT</button>

      </div>
    );
  }
}
const mapDispatch = {
  createProposal,
};
export default connect(null, mapDispatch)(CreateProposal);
