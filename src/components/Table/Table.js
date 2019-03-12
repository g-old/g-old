// taken from grommet: https://github.com/grommet/grommet/blob/master/src/js/components/Table.js

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import classnames from 'classnames';
import s from './Table.css';
import Selection from '../../core/Selection';
import Responsive from '../../core/Responsive';
import InfiniteScroll from '../../core/InfiniteScroll';

// empirical number describing a minimum cell width for a
// table to be presented in column-mode.
const MIN_CELL_WIDTH = 120;

function getTotalCellCount(cells) {
  let cellCount = 0;
  [].forEach.call(cells, cell => {
    const colspan = cell.getAttribute('colspan');
    cellCount += colspan ? parseInt(colspan, 10) : 1;
  });

  return cellCount;
}

// function that filters the items that are not
// an immediate child of its parent
function immediateTableChildOnly(result, tableParent) {
  const immediateChild = [];
  [].forEach.call(result, item => {
    let currentParent = item.parentNode;
    while (currentParent) {
      if (currentParent.tagName.toLowerCase() === 'table') {
        if (currentParent === tableParent) {
          immediateChild.push(item);
        }
        break;
      }
      currentParent = currentParent.parentNode;
    }
  });
  return immediateChild;
}

function findHead(children) {
  if (!children) {
    return undefined;
  }

  const childElements = Children.toArray(children); // eslint-disable-line no-undef

  let head;
  childElements.some(child => {
    if (
      child.type &&
      (child.type === 'thead' ||
      child.type === TableHeader || // eslint-disable-line no-undef
        child.type.displayName === TableHeader.displayName) // eslint-disable-line no-undef
    ) {
      head = child;
      return true;
    }
    if (child.props && child.props.children) {
      head = findHead(child.props.children);
      if (head) {
        return true;
      }
    }
    return false;
  });

  return head;
}

class Table extends React.Component {
  static propTypes = {
    selected: PropTypes.arrayOf(PropTypes.number),
    scrollable: PropTypes.bool,
    onMore: PropTypes.func,
    selectable: PropTypes.string,
    onSelect: PropTypes.func,
    children: PropTypes.element,
    className: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    responsive: PropTypes.bool,
    onMouseUp: PropTypes.func,
    onMouseDown: PropTypes.func,
  };

  static defaultProps = {
    selected: null,
    scrollable: false,
    onMore: null,
    selectable: null,
    onSelect: null,
    children: PropTypes.element,
    className: null,
    onBlur: null,
    onFocus: null,
    responsive: null,
    onMouseUp: null,
    onMouseDown: null,
  };

  constructor(props, context) {
    super(props, context);

    this.onClick = this.onClick.bind(this);
    this.onResize = this.onResize.bind(this);
    this.layout = this.layout.bind(this);
    this.onResponsive = this.onResponsive.bind(this);
    this.onViewPortChange = this.onViewPortChange.bind(this);

    this.state = {
      activeRow: undefined,
      mouseActive: false,
      selected: Selection.normalizeIndexes(props.selected),
      columnMode: false,
      small: false,
    };
  }

  componentDidMount() {
    const { onMore, scrollable } = this.props;
    const { columnMode, small } = this.state;
    this.setSelection();
    if (scrollable && !columnMode && !small) {
      this.alignMirror();
    }
    if (this.props.onMore) {
      this.scroll = InfiniteScroll.startListeningForScroll(
        this.moreRef,
        onMore,
      );
    }
    this.adjustBodyCells();
    setTimeout(this.layout, 50);
    window.addEventListener('resize', this.onResize);

    this.responsive = Responsive.start(this.onViewPortChange);
  }

  componentWillReceiveProps(nextProps) {
    if (this.scroll) {
      InfiniteScroll.stopListeningForScroll(this.scroll);
      this.scroll = undefined;
    }
    if (nextProps.selected !== undefined) {
      this.setState({
        selected: Selection.normalizeIndexes(nextProps.selected),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { onMore, scrollable } = this.props;
    const { columnMode, selected, small } = this.state;
    if (JSON.stringify(selected) !== JSON.stringify(prevState.selected)) {
      this.setSelection();
    }
    if (scrollable && !columnMode && !small) {
      this.alignMirror();
    }
    if (onMore && !this.scroll) {
      this.scroll = InfiniteScroll.startListeningForScroll(
        this.moreRef,
        onMore,
      );
    }
    this.adjustBodyCells();
    this.layout();
  }

  componentWillUnmount() {
    if (this.scroll) {
      InfiniteScroll.stopListeningForScroll(this.scroll);
    }
    clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.onResize);

    this.responsive.stop();
  }

  onViewPortChange(small) {
    this.setState({ small });
  }

  onResponsive() {
    const { columnMode } = this.state;
    if (this.containerRef && this.tableRef) {
      const availableSize = this.containerRef.offsetWidth;
      const numberOfCells = getTotalCellCount(
        immediateTableChildOnly(
          this.tableRef.querySelectorAll('thead th'),
          this.tableRef,
        ),
      );

      if (numberOfCells * MIN_CELL_WIDTH > availableSize) {
        if (columnMode === false) {
          this.setState({ columnMode: true });
        }
      } else if (columnMode === true) {
        this.setState({ columnMode: false });
      }
    }
  }

  onClick(event) {
    const { onSelect, selectable, selected } = this.props;

    const selection = Selection.onClick(event, {
      containerElement: this.container(),
      childSelector: 'tr',
      selectedClass: s.selected,
      multiSelect: selectable === 'multiple',
      priorSelectedIndexes: this.state.selected,
    });
    // only set the selected state and classes if the caller isn't managing it.
    if (selected === undefined) {
      this.setState({ selected: selection }, this.setSelection);
    }

    if (onSelect) {
      onSelect(selection.length === 1 ? selection[0] : selection);
    }
  }

  onResize() {
    // debounce
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(this.layout, 50);
  }

  setSelection() {
    const { selected } = this.state;
    Selection.setClassFromIndexes({
      containerElement: this.container(),
      childSelector: 'tr',
      selectedClass: s.selected,
      selectedIndexes: selected,
    });
  }

  container() {
    let containerElement = this.tableRef;
    if (containerElement) {
      const tableBodies = containerElement.getElementsByTagName('TBODY');
      if (tableBodies.length > 0) {
        containerElement = tableBodies[0];
      }
    }
    return containerElement;
  }

  adjustBodyCells() {
    // adjust table body cells to have link to the header
    // so that in responsive mode it displays the text as content in css.
    // IMPORTANT: non-text header cells, such as icon, are rendered as empty
    // headers.
    if (this.tableRef) {
      const headerCells = immediateTableChildOnly(
        this.tableRef.querySelectorAll('thead th'),
        this.tableRef,
      );
      const totalHeaderCells = getTotalCellCount(headerCells);
      if (headerCells.length > 0) {
        const increments = [];
        headerCells.forEach(cell => {
          const colspan = cell.getAttribute('colspan');
          increments.push(colspan ? parseInt(colspan, 10) : 1);
        });

        const rows = immediateTableChildOnly(
          this.tableRef.querySelectorAll('tbody tr'),
          this.tableRef,
        );

        rows.forEach(row => {
          let incrementCount = 0;
          let headerIndex = 0;

          if (getTotalCellCount(row.cells) !== totalHeaderCells) {
            console.error(
              'Table row cells do not match length of header cells.',
            );
          }

          [].forEach.call(row.cells, cell => {
            const colspan = cell.getAttribute('colspan');
            const cellCount = colspan ? parseInt(colspan, 10) : 1;
            if (cellCount < totalHeaderCells) {
              // only set the header if the cell colspan is smaller
              // than the total header cells
              cell.setAttribute(
                'data-th',
                headerCells[headerIndex].innerText ||
                  headerCells[headerIndex].textContent,
              );
            }

            incrementCount += 1;
            if (incrementCount === increments[headerIndex]) {
              incrementCount = 0;
              headerIndex += 1;
            }
          });
        });
      }
    }
  }

  layout() {
    const { scrollable } = this.props;
    const { small } = this.state;
    if (scrollable && !small) {
      this.alignMirror();
    }
    this.onResponsive();
  }

  alignMirror() {
    const mirrorElement = this.mirrorRef;
    if (mirrorElement) {
      const mirrorCells = immediateTableChildOnly(
        mirrorElement.querySelectorAll('thead tr th'),
        mirrorElement,
      );
      if (this.mirrorRef && mirrorCells.length > 0) {
        const tableElement = this.tableRef;
        const cells = immediateTableChildOnly(
          tableElement.querySelectorAll('thead tr th'),
          tableElement,
        );

        let rect = tableElement.getBoundingClientRect();
        mirrorElement.style.width = `${Math.floor(rect.right - rect.left)}px`;

        let height = 0;
        for (let i = 0; i < cells.length; i += 1) {
          rect = cells[i].getBoundingClientRect();
          mirrorCells[i].style.width = `${Math.floor(
            rect.right - rect.left,
          )}px`;
          mirrorCells[i].style.height = `${Math.floor(
            rect.bottom - rect.top,
          )}px`;
          height = Math.max(height, Math.floor(rect.bottom - rect.top));
        }
        mirrorElement.style.height = `${height}px`;
      }
    }
  }

  render() {
    const {
      children,
      className,
      onBlur,
      onFocus,
      onMore,
      responsive,
      scrollable,
      selectable,
      onMouseUp,
      onMouseDown,
      ...props
    } = this.props;
    delete props.onSelect;
    delete props.selected;
    const { activeRow, columnMode, focus, mouseActive, small } = this.state;
    const classes = classnames(
      s.table,
      {
        [s.small]: responsive && columnMode,
        [s.selectable]: selectable,
        [s.scrollable]: scrollable && !small,
      },
      className,
    );
    let mirror;
    /* eslint-disable no-return-assign */
    if (scrollable && !small) {
      const head = findHead(children);
      mirror = (
        <table ref={ref => (this.mirrorRef = ref)} className={s.mirror}>
          {head}
        </table>
      );
    }

    let more;
    if (onMore) {
      more = (
        <div ref={ref => (this.moreRef = ref)} className={s.more}>
          {'LOADING :::'}
        </div>
      );
    }
    /* eslint-enable no-return-assign */

    let selectableProps;
    if (selectable) {
      const tableMessage = 'Table';
      selectableProps = {
        'aria-label': `${tableMessage}`,
        tabIndex: '0',
        onClick: this.onClick,
        onMouseDown: event => {
          this.setState({ mouseActive: true });
          if (onMouseDown) {
            onMouseDown(event);
          }
        },
        onMouseUp: event => {
          this.setState({ mouseActive: false });
          if (onMouseUp) {
            onMouseUp(event);
          }
        },
        onFocus: event => {
          if (mouseActive === false) {
            this.setState({ focus: true });
          }
          if (onFocus) {
            onFocus(event);
          }
        },
        onBlur: event => {
          if (activeRow) {
            const rows = immediateTableChildOnly(
              this.tableRef.querySelectorAll('tbody tr'),
              this.tableRef,
            );
            rows[activeRow].classList.remove(s.active);
          }
          this.setState({ focus: false, activeRow: undefined });
          if (onBlur) {
            onBlur(event);
          }
        },
      };
    }

    const tableClasses = classnames({
      [s.focus]: focus,
    });
    /* eslint-disable no-return-assign */

    return (
      <div
        ref={ref => (this.containerRef = ref)}
        {...props}
        className={classes}
      >
        {mirror}
        <table
          ref={ref => (this.tableRef = ref)}
          {...selectableProps}
          className={tableClasses}
        >
          {children}
        </table>
        {more}
      </div>
    );
  }
}

export default withStyles(s)(Table);
