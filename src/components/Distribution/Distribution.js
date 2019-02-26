// taken from https://github.com/grommet/grommet/blob/master/src/js/components/Distribution.js
/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";
import withStyles from "isomorphic-style-loader/withStyles";
import s from "./Columns.css";

throw Error("TO IMPLEMENT");
const SMALL_SIZE = 120;
const GUTTER_SIZE = 4;

class Distribution extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
    this.resizeTimer = setTimeout(this.layout, 200);
  }

  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(this.layout, 0);
  }

  layout() {
    const container = this.containerRef;
    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (
      width !== this.state.width ||
      height !== this.state.height ||
      !this.state.items
    ) {
      this.setState(
        {
          width: width,
          height: height,
        },
        this.placeItems,
      );
    }
  }

  _placeItems() {
    const width = this.state.width;
    const height = this.state.height;
    const areaPer = width * height / this.state.total;
    let remainingRect = { x: 0, y: 0, width: width, height: height };
    let items = [];
    let series = this.props.series ? this.props.series.slice(0) : [];

    while (series.length > 0) {
      const datum = series.shift();
      if (datum.value <= 0) {
        continue;
      }

      let itemRect;
      const boxWidth = Math.round(areaPer * datum.value / remainingRect.height);
      const boxHeight = Math.round(areaPer * datum.value / remainingRect.width);
      if (
        remainingRect.width - boxWidth >= SMALL_SIZE &&
        remainingRect.width > remainingRect.height
      ) {
        // landscape, lay out left to right
        itemRect = {
          x: remainingRect.x,
          y: remainingRect.y,
          width: boxWidth,
          height: remainingRect.height,
        };
        remainingRect.x += itemRect.width;
        remainingRect.width -= itemRect.width;
      } else {
        // portrait, lay out top to bottom
        itemRect = {
          x: remainingRect.x,
          y: remainingRect.y,
          width: remainingRect.width,
          height: boxHeight,
        };
        remainingRect.y += itemRect.height;
        remainingRect.height -= itemRect.height;
      }

      let boxRect = this.boxRect(itemRect, width, height);
      let labelRect = this.labelRect(boxRect);

      // Save this so we can render the item's box and label
      // in the correct location.
      items.push({
        datum: datum,
        rect: itemRect,
        boxRect: boxRect,
        labelRect: labelRect,
      });
    }

    this.setState({ items: items });
  }

  boxRect(itemRect, width, height) {
    // leave a gutter between items, if we're not at the edge
    let boxRect = { ...itemRect };
    if (0 !== boxRect.x && width > boxRect.x + boxRect.width) {
      boxRect.x += GUTTER_SIZE / 2;
      boxRect.width -= GUTTER_SIZE;
    }
    if (0 !== boxRect.y && height > boxRect.y + boxRect.height) {
      boxRect.y += GUTTER_SIZE / 2;
      boxRect.height -= GUTTER_SIZE;
    }
    boxRect.width -= GUTTER_SIZE;
    boxRect.height -= GUTTER_SIZE;
    // flush the right edge
    if (boxRect.x + boxRect.width > width - 4 * GUTTER_SIZE) {
      boxRect.width = width - boxRect.x;
    }
    // flush the bottom edge
    if (boxRect.y + boxRect.height > height - 4 * GUTTER_SIZE) {
      boxRect.height = height - boxRect.y;
    }
    return boxRect;
  }
  labelRect(boxRect) {
    let labelRect = { ...boxRect };
    return labelRect;
  }

  itemColorIndex(item, index) {
    return item.colorIndex || "graph-" + (index + 1);
  }

  renderItemBox(boxRect) {
    return (
      <rect
        className={cn(s.itemBox)}
        x={boxRect.x}
        y={boxRect.y}
        width={boxRect.width}
        height={boxRect.height}
      />
    );
  }

  renderItem(datum, rect, index) {
    const { units } = this.props;

    let activeDistributionRef;
    if (index === this.state.activeIndex) {
      activeDistributionRef = ref => (this.activeDistributionRef = ref);
    }

    const colorIndex = this._itemColorIndex(datum, index);

    const contents = this._renderItemBox(rect, colorIndex);

    const value =
      datum.labelValue !== undefined ? datum.labelValue : datum.value;
    const labelMessage = `${value} ${units || ""} ${datum.label}`;

    return (
      <g
        key={index}
        className={cn(s.item, datum.onClick ? s.itemClickable : "")}
        role={datum.onClick ? "button" : "row"}
        ref={activeDistributionRef}
        aria-label={labelMessage}
        onFocus={() => this.setState({ activeIndex: index })}
        data-index={index}
        onClick={datum.onClick}
      >
        {contents}
      </g>
    );
  }

  renderBoxes() {
    return this.state.items.map((item, index) => {
      return this.renderItem(item.datum, item.boxRect, index);
    });
  }

  renderLabels() {
    return this.state.items.map((item, index) => {
      return this._renderItemLabel(item.datum, item.labelRect, index);
    });
  }

  render() {
    const { allIcons, height, items, mouseActive, width } = this.state;

    if (items) {
      let boxes = [];
      let labels;
      if (items) {
        boxes = this.renderBoxes();
        labels = this.renderLabels();
      }
    }
  }
}
