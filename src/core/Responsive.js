// (C) Copyright 2014 Hewlett Packard Enterprise Development LP

/*
 * Responsive is a utility for tracking the display size.
 * It aligns with CSS media queries.
 */

const SMALL_WIDTH_EM = 44.9375; // align with _settings.responsive.scss

export function smallSize() {
  let fontSize = '16px';
  // unit tests don't have getComputedStyle
  if (window.getComputedStyle) {
    fontSize = window.getComputedStyle(document.documentElement).fontSize;
  }
  return SMALL_WIDTH_EM * parseFloat(fontSize);
}

export default {
  // Track responsive sizing.
  //
  // Example:
  // inside componentDidMount()
  //   this._responsive = Responsive.start(this._onResponsive);
  // inside componentWillUnmount()
  //   this._responsive.stop()

  start(func) {
    const responsive = {
      func,
      timer: undefined,
      small: undefined,
      smallSize: this.smallSize(),
    };
    responsive.onResize = this.onResize.bind(this, responsive);
    responsive.layout = this.check.bind(this, responsive);
    responsive.stop = this.stop.bind(this, responsive);
    window.addEventListener('resize', responsive.onResize);
    responsive.layout();
    return responsive;
  },

  stop(responsive) {
    clearTimeout(responsive.timer);
    window.removeEventListener('resize', responsive.onResize);
  },

  onResize(responsive) {
    // Don't debounce so we align more closely with how the stylesheets are
    // processed.
    responsive.layout();
  },

  check(responsive) {
    if (window.innerWidth <= responsive.smallSize) {
      if (!responsive.small) {
        // eslint-disable-next-line
        responsive.small = true;
        responsive.func(true);
      }
    } else if (responsive.small !== false) {
      // eslint-disable-next-line
      responsive.small = false;
      responsive.func(false);
    }
  },

  smallSize,
};
