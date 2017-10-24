// Heavily inspired by grommet
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import InfiniteScroll from '../../core/InfiniteScroll';
import s from './List.css';

class List extends React.Component {
  static propTypes = {
    onMore: PropTypes.func,
    children: PropTypes.element.isRequired,
  };

  static defaultProps = {
    onMore: null,
  };
  constructor(props, context) {
    super(props, context);
    // this.onClick = this.onClick.bind(this);
    this.state = { activeItem: undefined };
  }

  componentDidMount() {
    const { onMore } = this.props;
    // this.setSelection();
    if (onMore) {
      this.scroll = InfiniteScroll.startListeningForScroll(
        this.moreRef,
        onMore,
      );
    }
  }
  componentWillReceiveProps() {
    if (this.scroll) {
      InfiniteScroll.stopListeningForScroll(this.scroll);
      this.scroll = undefined;
    }
  }
  componentDidUpdate() {
    const { onMore } = this.props;

    if (onMore && !this.scroll) {
      this.scroll = InfiniteScroll.startListeningForScroll(
        this.moreRef,
        onMore,
      );
    }
  }

  componentWillUnmount() {
    if (this.scroll) {
      InfiniteScroll.stopListeningForScroll(this.scroll);
    }
  }
  /* eslint-disable no-return-assign */

  render() {
    const { children, onMore } = this.props;
    let more;

    if (onMore) {
      more = (
        <li ref={ref => (this.moreRef = ref)} className={s.more}>
          {'LOADING ...'}
        </li>
      );
    }
    return (
      <ul className={s.list} ref={ref => (this.listRef = ref)}>
        {children}
        {more}
      </ul>
    );
  }
}
/* eslint-enable no-return-assign */

export default withStyles(s)(List);
