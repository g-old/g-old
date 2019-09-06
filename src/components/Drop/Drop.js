// Taken from https://github.com/grommet/grommet/blob/master/src/js/utils/Drop.js

/* eslint-disable no-mixed-operators */
// @flow
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import DropContents from '../DropContents';
import { findScrollParents, findVisibleParent } from '../../core/helpers';

type tOptions = {
  align: {
    top?: 'top' | 'bottom',
    bottom?: 'top' | 'bottom',
    left?: 'left' | 'right',
    right?: 'left' | 'right',
  },
  minWidth?: number,
  maxWidth?: number,
  responsive?: boolean,
  className?: string,
  context: any,
};
class Drop {
  control: any;

  content: any;

  options: tOptions;

  state: {
    container: any,
    control: any,
    options: tOptions,
  };

  constructor(control: any, content: any, options: tOptions) {
    const { context } = options;

    // bind functions to instance
    this.render = this.render.bind(this);
    this.remove = this.remove.bind(this);
    this.place = this.place.bind(this);
    this.onResize = this.onResize.bind(this);
    this.control = control;

    // setup DOM
    const container = document.createElement('div');
    container.className = options.className || null;

    // prepend in body to avoid browser scroll issues
    document.body.insertBefore(container, document.body.firstChild);

    /*  render(<DropContents content={content} context={context} />, container); */

    const scrollParents = findScrollParents(control);

    // initialize state
    const normalizedOptions = { ...options };
    normalizedOptions.align = options.align || {};
    if (!normalizedOptions.align.top && !normalizedOptions.align.bottom) {
      normalizedOptions.align.top = 'top';
    }
    if (!normalizedOptions.align.left && !normalizedOptions.align.right) {
      normalizedOptions.align.left = 'left';
    }
    normalizedOptions.responsive =
      normalizedOptions.responsive !== false
        ? true
        : normalizedOptions.responsive;

    this.state = {
      container,
      control,
      options: normalizedOptions,
      scrollParents,
    };
    render(
      <DropContents content={content} context={context} />,
      container,
      () => this.place(),
    );

    this.listen();

    // position content
    this.place();
  }

  listen() {
    const { scrollParents } = this.state;
    scrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', this.place);
    });
    // we intentionally skipped debounce as we believe resizing
    // will not be a common action. Also the UI looks better if the Drop
    // doesn’t lag to align with the control component.
    window.addEventListener('resize', this.onResize);
  }

  onResize() {
    const { scrollParents } = this.state;
    // we need to update scroll parents as Responsive options may change
    // the parent for the target element
    scrollParents.forEach(scrollParent => {
      scrollParent.removeEventListener('scroll', this.place);
    });

    const nextScrollParents = findScrollParents(this.control);

    nextScrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', this.place);
    });

    this.state.scrollParents = nextScrollParents;

    this.place();
  }

  place() {
    const {
      control,
      container,
      options: { align, responsive, minWidth, maxWidth },
    } = this.state;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // clear prior styling
    container.style.left = '';
    container.style.width = '';
    container.style.top = '';
    container.style.maxHeight = '';

    // get bounds
    const controlRect = findVisibleParent(control).getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // determine width
    // the width will never be bigger than maxWidth or windowWidth
    // under that constraint, we try to make the Drop at least minWidth wide
    const width = Math.min(
      Math.max(controlRect.width, containerRect.width, minWidth || 0),
      maxWidth || windowWidth,
      windowWidth,
    );
    //
    // set left position
    /* eslint-disable prefer-destructuring */
    let left;
    if (align.left) {
      if (align.left === 'left') {
        left = controlRect.left;
      } else if (align.left === 'right') {
        left = controlRect.left - width;
      }
    } else if (align.right) {
      if (align.right === 'left') {
        left = controlRect.left - width;
      } else if (align.right === 'right') {
        left = controlRect.left + controlRect.width - width;
      }
    }

    if (left + width > windowWidth) {
      left -= left + width - windowWidth;
    } else if (left < 0) {
      left = 0;
    }

    // set top position
    let top;
    let maxHeight;
    if (align.top) {
      if (align.top === 'top') {
        top = controlRect.top;
        maxHeight = Math.min(windowHeight - controlRect.top, windowHeight);
      } else {
        top = controlRect.bottom;
        maxHeight = Math.min(
          windowHeight - controlRect.bottom,
          windowHeight - controlRect.height,
        );
      }
    } else if (align.bottom) {
      if (align.bottom === 'bottom') {
        top = controlRect.bottom - containerRect.height;
        maxHeight = Math.max(controlRect.bottom, 0);
      } else {
        top = controlRect.top - containerRect.height;
        maxHeight = Math.max(controlRect.top, 0);
      }
    }
    // if we can't fit it all, see if there's more room the other direction
    if (containerRect.height > maxHeight) {
      // We need more room than we have.
      if (align.top && top > windowHeight / 2) {
        // We put it below, but there's more room above, put it above
        if (align.top === 'bottom') {
          if (responsive) {
            top = Math.max(controlRect.top - containerRect.height, 0);
          }
          maxHeight = controlRect.top;
        } else {
          if (responsive) {
            top = Math.max(controlRect.bottom - containerRect.height, 0);
          }
          maxHeight = controlRect.bottom;
        }
      } else if (align.bottom && maxHeight < windowHeight / 2) {
        // We put it above but there's more room below, put it below
        if (align.bottom === 'bottom') {
          if (responsive) {
            top = controlRect.top;
          }
          maxHeight = Math.min(windowHeight - top, windowHeight);
        } else {
          if (responsive) {
            top = controlRect.bottom;
          }
          maxHeight = Math.min(
            windowHeight - top,
            windowHeight - controlRect.height,
          );
        }
      }
    }
    /* eslint-enable prefer-destructuring */
    // Old way, probably problems on mobile
    // for Chrome, Safari, and Opera, use document.body
    // for Firefox and IE, use document.documentElement
    /* const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

       container.style.left = `${left}px`;
       container.style.width = `${width}px`;
       // We use position:absolute and the body element's position
       // to handle mobile browsers better. We used to use position:fixed
       // but that didn't work on mobile browsers as well.
       container.style.top = `${top + scrollTop}px`;
       container.style.maxHeight = `${windowHeight - (top + scrollTop)}px`; */
    container.style.left = `${left}px`;
    // offset width by 0.1 to avoid a bug in ie11 that
    // unnecessarily wraps the text if width is the same
    container.style.width = `${width + 0.1}px`;
    // the (position:absolute + scrollTop)
    // is presenting issues with desktop scroll flickering
    container.style.top = `${top}px`;
    container.style.maxHeight = `${windowHeight - top}px`;
  }

  render(content) {
    const {
      container,
      options: { context },
    } = this.state;
    const originalScrollPosition = container.scrollTop;
    render(
      <DropContents content={content} context={context} />,
      container,
      () => {
        this.place();
        // reset container to its original scroll position
        container.scrollTop = originalScrollPosition;
      },
    );
  }

  remove() {
    const { container, scrollParents } = this.state;
    scrollParents.forEach(scrollParent => {
      scrollParent.removeEventListener('scroll', this.place);
    });
    window.removeEventListener('resize', this.onResize);

    unmountComponentAtNode(container);
    document.body.removeChild(container);

    this.state = undefined;
  }
}

export default Drop;
