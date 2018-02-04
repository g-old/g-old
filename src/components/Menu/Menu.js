// taken from https://github.com/grommet/grommet/blob/master/src/js/components/Menu.js

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Menu.css';
import Box from '../Box';
import Button from '../Button';
import Drop from '../Drop';
import MenuDrop from '../MenuDrop';

const onSink = event => {
  event.stopPropagation();
  // need to go native to prevent closing via document
  event.nativeEvent.stopImmediatePropagation();
};

class Menu extends React.Component {
  static propTypes = {
    dropAlign: PropTypes.shape({ right: PropTypes.string }),
    icon: PropTypes.node,
    label: PropTypes.string,
    closeOnClick: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    withControl: PropTypes.bool,
    primary: PropTypes.bool,
  };

  static defaultProps = {
    dropAlign: { left: 'left', top: 'top' },
    icon: null,
    label: null,
    closeOnClick: true,
    children: null,
    withControl: false,
    primary: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      state: 'collapsed',
    };
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.checkOnClose = this.checkOnClose.bind(this);
    this.renderMenuDrop = this.renderMenuDrop.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.state !== prevState.state) {
      switch (this.state.state) {
        case 'collapsed': {
          document.removeEventListener('click', this.checkOnClose);
          document.removeEventListener('touchstart', this.checkOnClose);
          if (this.drop) {
            this.drop.remove();
            this.drop = undefined;
          }
          break;
        }
        case 'expanded': {
          if (!this.drop) {
            document.addEventListener('click', this.checkOnClose);
            document.addEventListener('touchstart', this.checkOnClose);
            this.drop = new Drop(
              // eslint-disable-next-line react/no-find-dom-node
              findDOMNode(this.controlRef),
              this.renderMenuDrop(),
              {
                align: this.props.dropAlign,
                context: this.context,
                /* responsive: false, */
                className: s.drop,
              },
            );
          }
          break;
        }
        default:
          throw new Error(`State not recognized: ${this.state.state}`);
      }
    } else if (this.state.state === 'expanded') {
      this.drop.render(this.renderMenuDrop());
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.checkOnClose);
    document.removeEventListener('touchstart', this.checkOnClose);
    if (this.drop) {
      this.drop.remove();
    }
  }

  onOpen() {
    this.setState({ state: 'expanded' });
  }
  onClose() {
    this.setState({ state: 'collapsed' });
  }

  checkOnClose(event) {
    /* eslint-disable react/no-find-dom-node */
    const drop = findDOMNode(this.menuDrop);
    const control = findDOMNode(this.controlRef);
    /* eslint-enable react/no-find-dom-node */

    if (
      drop &&
      !drop.contains(event.target) &&
      !control.contains(event.target)
    ) {
      this.onClose();
    }
  }
  renderMenuDrop() {
    let control = null;
    if (this.props.withControl) {
      control = (
        <Button
          className={s.menu_control}
          plain
          reverse
          label={this.props.label}
          icon={this.props.icon}
          onClick={this.onClose}
        />
      );
    }
    /* eslint-disable no-return-assign */

    const onClick = this.props.closeOnClick ? this.onClose : onSink;
    return (
      <MenuDrop
        {...this.context}
        onClick={onClick}
        control={control}
        ref={ref => (this.menuDrop = ref)}
        align={this.props.dropAlign}
      >
        {this.props.children}
      </MenuDrop>
    );
  }

  render() {
    const { icon, primary } = this.props;
    return (
      <Box
        className={primary ? s.primary : null}
        ref={ref => (this.controlRef = ref)}
        column
      >
        <Button
          plain
          reverse
          icon={icon}
          label={this.props.label}
          onClick={this.onOpen}
        />
      </Box>
    );
  }
}
/* eslint-enable no-return-assign */
Menu.contextTypes = {
  intl: PropTypes.object,
  insertCss: PropTypes.any,
};

export default withStyles(s)(Menu);
