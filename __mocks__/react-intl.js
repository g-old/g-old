// ./__mocks__/react-intl.js
import React from 'react';

const Intl = require.requireActual('react-intl');
const identityFunction = i => i;

// Here goes intl context injected into component, feel free to extend
const intl = {
  formatMessage: ({ defaultMessage }) => defaultMessage,
  formatDate: identityFunction,
  formatTime: identityFunction,
  formatRelative: identityFunction,
  formatNumber: identityFunction,
  formatPlural: identityFunction,
  formatHTMLMessage: identityFunction,
  now: identityFunction,
};

Intl.injectIntl = Node => {
  const renderWrapped = props => <Node {...props} intl={intl} />;
  renderWrapped.displayName = Node.displayName || Node.name || 'Component';
  return renderWrapped;
};
/* eslint-disable react/prop-types */
Intl.FormattedMessage = ({ defaultMessage }) => <span>{defaultMessage}</span>;
Intl.FormattedHTMLMessage = ({ defaultMessage }) => (
  <span>{defaultMessage}</span>
);
/* eslint-enable react/prop-types */

module.exports = Intl;
/*
import React, { Component } from 'react';

const Intl = require('react-intl');

const identityFunction = i => i;

// Here goes intl context injected into component, feel free to extend
const intl = {
  formatDate: identityFunction,
  formatTime: identityFunction,
  formatRelative: identityFunction,
  formatNumber: identityFunction,
  formatPlural: identityFunction,
  formatHTMLMessage: identityFunction,
  now: identityFunction,
  formatMessage: o => o.defaultMessage,
};

// Mock following implementations so that they do not break
Intl.injectIntl = Node => {
  // If we are injecting a Class, return a class, otherwise return the functional component
  // This is useful in cases where you are shallowing a component to test a single method.
  if (Node.prototype instanceof Component) {
    return class extends Node {
      static defaultProps = {
        ...(Node.defaultProps || {}),
        intl,
      };

      render() {
        return <Node {...this.props} />;
      }
    };
  }
  return props => <Node {...props} intl={intl} />;
};

Intl.FormattedMessage = ({ defaultMessage }) => <span>{defaultMessage}</span>;
Intl.FormattedHTMLMessage = ({ defaultMessage }) => (
  <span>{defaultMessage}</span>
);

module.exports = Intl;
*/
