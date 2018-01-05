import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './Form.css';

class Form extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.element.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };
  static defaultProps = { className: null };

  render() {
    const { className, ...props } = this.props;
    const classes = classnames(s.form, className);

    return (
      <form {...props} className={classes} onSubmit={this.props.onSubmit}>
        {this.props.children}
      </form>
    );
  }
}

export default withStyles(s)(Form);
