// taken from https://github.com/grommet/grommet/blob/master/src/js/utils/InfiniteScroll.js

import { findScrollParents } from './helpers';

const SCROLL_MORE_DELAY = 500; // when the user scrolls
const SCROLL_MORE_INITIAL_DELAY = 50; // when we start out at the bottom already

function evaluate(scrollState) {
  (scrollState.scrollParents || []).forEach(scrollParent => {
    // are we at the bottom?
    let bottom;
    if (scrollParent === document) {
      bottom = window.innerHeight;
    } else {
      // eslint-disable-next-line prefer-destructuring
      bottom = scrollParent.getBoundingClientRect().bottom;
    }
    const indicatorRect = scrollState.indicatorElement.getBoundingClientRect();
    // Only if bottom isn't zero. This can happen when content hasn't
    // arrived yet.
    // 10px offset is to ensure onEnd() gets called
    if (bottom && indicatorRect.bottom <= bottom + 10) {
      scrollState.onEnd();
    }
  });
}

function onScroll(scrollState) {
  // delay a bit to ride out quick users
  clearTimeout(scrollState.scrollTimer);
  // eslint-disable-next-line no-param-reassign
  scrollState.scrollTimer = setTimeout(
    () => evaluate(scrollState),
    SCROLL_MORE_DELAY,
  );
}

function onResize(scrollState) {
  clearTimeout(scrollState.scrollTimer);
  // eslint-disable-next-line no-param-reassign
  scrollState.scrollTimer = setTimeout(
    () => evaluate(scrollState),
    SCROLL_MORE_DELAY,
  );
}

export default {
  startListeningForScroll(indicatorElement, onEnd) {
    const scrollState = {
      onEnd,
      indicatorElement,
      scrollParents: findScrollParents(indicatorElement),
    };

    scrollState.onResize = onResize.bind(this, scrollState);
    scrollState.onScroll = onScroll.bind(this, scrollState);

    window.addEventListener('resize', scrollState.onResize);
    // check in case we're already at the bottom and the indicator is visible
    (scrollState.scrollParents || []).forEach(scrollParent => {
      scrollParent.addEventListener('scroll', scrollState.onScroll);
      if (scrollParent === document || scrollParent === document.body) {
        const rect = indicatorElement.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          scrollState.scrollTimer = setTimeout(
            onEnd,
            SCROLL_MORE_INITIAL_DELAY,
          );
        }
      }
    });
    return scrollState;
  },

  stopListeningForScroll(scrollState) {
    (scrollState.scrollParents || []).forEach(scrollParent => {
      clearTimeout(scrollState.scrollTimer);
      scrollParent.removeEventListener('scroll', scrollState.onScroll);
      window.removeEventListener('resize', scrollState.onResize);
    });
    // eslint-disable-next-line no-param-reassign
    scrollState.scrollParents = undefined;
  },
};
