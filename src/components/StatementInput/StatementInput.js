import React, { PropTypes } from 'react';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import s from './StatementInput.css';


class StatementInput extends React.Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }
  handleOnSubmit(e) {
    const data = { title: 'NEW TITLE', text: 'NEW TEXT' };
    this.props.onSubmit(data);
    e.preventDefault();
  }

  render() {
    return (
      <div>
      INPUT

        <input />
        <textarea />
        <button onClick={(e) => this.handleOnSubmit(e)}> ABSCHICKEN </button>
      </div>
    );
  }
}

export default StatementInput;
