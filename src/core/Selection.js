// (C) Copyright 2015 Hewlett Packard Enterprise Development LP

// Functions to manage selection via both child index and a specific class name.

// Ensures it is an array.
function normalizeIndexes(selectedIndexes) {
  let result;
  if (undefined === selectedIndexes || selectedIndexes === null) {
    result = [];
  } else if (typeof selectedIndexes === 'number') {
    result = [selectedIndexes];
  } else {
    result = selectedIndexes;
  }
  return result;
}

// Clears any selected items
// options: {containerElement: , selectedClass: }
function clearClass(options) {
  if (options && options.containerElement) {
    const items = options.containerElement.querySelectorAll(
      `.${options.selectedClass}`,
    );
    for (let i = 0; i < items.length; i += 1) {
      items[i].classList.remove(options.selectedClass);
    }
  }
}

// Sets the selectedClass on all children whose index is in selectedIndexes.
// options: {containerElement: , childSelector: , selectedClass: ,
//    selectedIndexes: []}
function setClassFromIndexes(options) {
  clearClass(options);
  if (options && options.containerElement && options.selectedIndexes) {
    const items = options.containerElement.querySelectorAll(
      options.childSelector,
    );
    options.selectedIndexes.forEach(index => {
      if (items[index]) {
        items[index].classList.add(options.selectedClass);
      }
    });
  }
}

// Gets the selected selectedClass on all children whose index is in
// selectedIndexes.
// options: {containerElement: , childSelector: , selectedClass: }
function getIndexesFromClass(options) {
  const items = options.containerElement.querySelectorAll(
    options.childSelector,
  );
  const selectedIndexes = [];
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].classList.contains(options.selectedClass)) {
      selectedIndexes.push(i);
    }
  }
  return selectedIndexes;
}

// Returns a new selectedIndexes array with the latest selected indexes
// options: {containerElement: , childSelector: , //selectedClass: ,
//   multiSelect: true|false, priorSelectedIndexes: []}
function onClick(event, options) {
  // Go up the DOM tree until we match the childSelector
  let item = event.target;
  let matchFunction =
    item.matches || item.matchesElement || item.msMatchesSelector;
  while (
    matchFunction &&
    item &&
    !matchFunction.bind(item, options.childSelector)()
  ) {
    item = item.parentNode;
    matchFunction =
      item.matches || item.matchesElement || item.msMatchesSelector;
  }

  // determine the index of the clicked element
  let indexInContainer = 0;
  let previousItem = item.previousSibling;
  while (previousItem != null) {
    previousItem = previousItem.previousSibling;
    indexInContainer += 1;
  }

  let selectedIndexes; // what will be returned

  if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
    selectedIndexes = [indexInContainer];
  } else {
    // was it selected?
    const indexInPrior = options.priorSelectedIndexes.indexOf(indexInContainer);

    if (!options.multiSelect) {
      if (indexInPrior !== -1 && (event.ctrlKey || event.metaKey)) {
        selectedIndexes = [];
      } else {
        selectedIndexes = options.priorSelectedIndexes;
      }
    } else {
      // multi-select

      // make a copy of the prior list so we can modify it
      selectedIndexes = options.priorSelectedIndexes.slice(0);

      if (event.shiftKey) {
        // select from nearest selected item to the currently selected item
        let closestIndex = -1;
        selectedIndexes.forEach(selectIndex => {
          if (closestIndex === -1) {
            closestIndex = selectIndex;
          } else if (
            Math.abs(indexInContainer - selectIndex) <
            Math.abs(indexInContainer - closestIndex)
          ) {
            closestIndex = selectIndex;
          }
        });

        for (let i = indexInContainer; i !== closestIndex; ) {
          selectedIndexes.push(i);
          if (closestIndex < indexInContainer) {
            i -= 1;
          } else {
            i += 1;
          }
        }

        if (indexInPrior > -1) {
          selectedIndexes.splice(indexInPrior, 1);
        }

        // Remove text selection. This often happens when shift multi-selecting
        window.getSelection().removeAllRanges();
      } else if (indexInPrior === -1) {
        // toggle
        selectedIndexes.push(indexInContainer);
      } else {
        selectedIndexes.splice(indexInPrior, 1);
      }
    }
  }

  return selectedIndexes;
}

export default {
  normalizeIndexes,
  clearClass,
  getIndexesFromClass,
  setClassFromIndexes,
  onClick,
};
