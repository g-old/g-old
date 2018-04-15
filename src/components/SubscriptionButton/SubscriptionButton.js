import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import s from './SubscriptionButton.css';
import Box from '../Box';
import Select from '../Select';

const messages = defineMessages({
  subscribe: {
    id: 'subscribe',
    defaultMessage: 'Subscribe',
    description: 'Label subscribe',
  },
  subscribed: {
    id: 'subscribed',
    defaultMessage: 'Subscribed',
    description: 'Label subscribed',
  },
  confirm: {
    id: 'confirm',
    defaultMessage: 'Subscribing for {subType}',
    description: 'Label okay',
  },
  all: {
    id: 'subscriptionType.all',
    defaultMessage: 'All',
    description: 'Subscribe for all available events',
  },
  followees: {
    id: 'subscriptionType.followees',
    defaultMessage: 'Followees',
    description: 'Subscribe for  events of followees',
  },
  updates: {
    id: 'subscriptionType.updates',
    defaultMessage: 'State updates',
    description: 'Subscribe for state updates',
  },
  delete: {
    id: 'subscriptionType.delete',
    defaultMessage: 'Unsubscribe',
    description: 'Deleting subscription',
  },
});
class SubscriptionButton extends React.Component {
  static propTypes = {
    subscription: PropTypes.shape({}),
    onSubscribe: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    subscription: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(e) {
    if (e) {
      this.props.onSubscribe({
        subscriptionType: e.option.value,
        targetType: 'PROPOSAL',
      });

      this.setState({ ...e.option });
    }
  }

  render() {
    const { subscription, intl } = this.props;
    const { value, label } = this.state;
    let displayValue;
    if (subscription) {
      displayValue = intl.formatMessage({ ...messages.subscribed });
    } else if (value) {
      displayValue = intl.formatMessage(
        { ...messages.confirm },
        { subType: label },
      );
    } else {
      displayValue = intl.formatMessage({ ...messages.subscribe });
    }
    return (
      <Box>
        <Select
          options={[
            subscription && {
              label: intl.formatMessage({
                ...messages.delete,
              }),
              value: 'DELETE',
            },
            {
              label: intl.formatMessage({
                ...messages.all,
              }),
              value: 'ALL',
            },
            {
              label: intl.formatMessage({
                ...messages.followees,
              }),
              value: 'FOLLOWEES',
            },
            {
              label: intl.formatMessage({
                ...messages.updates,
              }),
              value: 'UPDATES',
            },
          ]}
          onSearch={false}
          value={{ label: displayValue, value: this.state.value || 'UPDATES' }}
          onChange={this.handleValueChange}
        />
      </Box>
    );
  }
}

export default withStyles(s)(injectIntl(SubscriptionButton));
