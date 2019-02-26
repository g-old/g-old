// taken from https://github.com/grommet/grommet/blob/master/src/js/components/Columns.js
/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Columns.css';

class Columns extends React.Component {
  componentDidMount() {
    if (this.props.masonry) {
      throw Error('To implement');
      // this._getColumnBreakpoints();
    }
    window.addEventListener('resize', this.onResize);
    setTimeout(this.layout, 10);
  }

  onResize() {
    clearTimeout(this.layoutTimer);
    this.layoutTimer = setTimeout(this.layout, 50);
  }

  layout() {
    const { masonry } = this.props;
    const container = this.containerRef;

    if (container && !masonry) {
      // fills columns top to bottom, then left to right
      const children = React.Children.toArray(this.props.children);
      let count = 1;
      const child = container.childNodes[0];
      if (child) {
        const rect = container.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();
        const widestCount = Math.floor(rect.width / childRect.width);
        const childrenPerColumn = Math.ceil(children.length / widestCount);
        count = Math.ceil(children.length / childrenPerColumn);
      }

      if (count === 0) {
        count = 1;
      }

      this.setState({ count });
    }
  }

  renderColumns() {
    const { masonry } = this.props;
    const children = React.Children.toArray(this.props.children);
    const groups = [];
    if (masonry) {
      const { maxCount } = this.state;
      const columnGroups = {};

      React.Children.map(
        children,
        (child, index) => {
          const currentColumn = index % maxCount;

          if (!columnGroups[currentColumn]) {
            columnGroups[currentColumn] = [];
          }

          // place children into appropriate column
          if (child) {
            columnGroups[currentColumn].push(child);
          }
        },
        this,
      );

      Object.keys(columnGroups).map((key, index) => {
        if (columnGroups[index]) {
          groups.push(columnGroups[index]);
        }
      });
    } else {
      const { count } = this.state;
      const childrenPerColumn = Math.ceil(children.length / count);
      let offset = 0;
      while (groups.length < count) {
        groups.push(children.slice(offset, offset + childrenPerColumn));
        offset += childrenPerColumn;
      }
    }
    return groups;
  }

  render() {
    throw Error('Not finished!');
    const { justify } = this.props;
    const { margin } = this.state;

    const groups = this.renderColumns();
    const columns = groups.map((group, index) =>
      <div key={index} className={s.column}>
        {group}
      </div>,
    );

    return (
      <div ref={ref => (this.containerRef = ref)}>
        {columns}
      </div>
    );
  }
}
/* eslint-enable */
export default withStyles(s)(Columns);
