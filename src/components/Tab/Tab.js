// inspired by grommet
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Tab.css';

class Tab extends React.Component {
  static propTypes = {
    title: PropTypes.node.isRequired,
    active: PropTypes.bool,
    id: PropTypes.string,
    onRequestForActive: PropTypes.func, // from Tabs
  };
  constructor() {
    super();
    this.onTabClick = this.onTabClick.bind(this);
  }
  onTabClick(event) {
    const { onRequestForActive } = this.props;
    if (event) {
      event.preventDefault();
    }
    onRequestForActive();
  }

  render() {
    const { active, id, title, ...props } = this.props;
    delete props.onRequestForActive;

    return (
      <li {...props} id={id} className={s.tab}>
        <button onClick={this.onTabClick} className={s.tab_button} name="tabButton">
          <label className={cn(s.tab_label, active && s.active)} htmlFor="tabButton">
            {title}
          </label>
        </button>
      </li>
    );
  }
}

export default withStyles(s)(Tab);
