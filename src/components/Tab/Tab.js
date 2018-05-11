// inspired by grommet
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Tab.css';
import Button from '../Button';

class Tab extends React.Component {
  static propTypes = {
    title: PropTypes.node.isRequired,
    active: PropTypes.bool,
    id: PropTypes.string.isRequired,
    onRequestForActive: PropTypes.func, // from Tabs
  };

  static defaultProps = {
    active: false,
    onRequestForActive: () => {},
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
        <Button plain onClick={this.onTabClick}>
          <label
            className={cn(s.tab_label, active && s.active)}
            htmlFor="tabButton"
          >
            {title}
          </label>
        </Button>
      </li>
    );
  }
}

export default withStyles(s)(Tab);
