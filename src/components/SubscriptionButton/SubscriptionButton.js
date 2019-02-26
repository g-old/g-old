import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
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
    defaultMessage: 'Subscribed ({subType})',
    description: 'Label subscribed',
  },
  confirm: {
    id: 'confirm',
    defaultMessage: 'Subscribing for {subType}',
    description: 'Label okay',
  },
  ALL: {
    id: 'subscriptionType.all',
    defaultMessage: 'All',
    description: 'Subscribe for all available events',
  },
  FOLLOWEES: {
    id: 'subscriptionType.followees',
    defaultMessage: 'Followees',
    description: 'Subscribe for  events of followees',
  },
  UPDATES: {
    id: 'subscriptionType.updates',
    defaultMessage: 'State updates',
    description: 'Subscribe for state updates',
  },
  REPLIES: {
    id: 'subscriptionType.replies',
    defaultMessage: 'Replies',
    description: 'Subscribe for replies',
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
    targetType: PropTypes.oneOf(['DISCUSSION', 'PROPOSAL']).isRequired,
    status: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
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
      if (!this.props.status.pending) {
        this.props.onSubscribe({
          subscriptionType: e.option.value,
          targetType: this.props.targetType || 'PROPOSAL',
        });

        this.setState({ ...e.option });
      }
    }
  }

  render() {
    const { subscription, intl, status = {} } = this.props;
    const { value } = this.state;
    let displayLabel;
    if (subscription) {
      displayLabel = intl.formatMessage(
        { ...messages.subscribed },
        {
          subType: intl
            .formatMessage({
              ...messages[subscription.subscriptionType],
            })
            .toUpperCase(),
        },
      );
    } else if (status.pending) {
      displayLabel = intl.formatMessage(
        { ...messages.confirm },
        {
          subType: intl
            .formatMessage({
              ...messages[value],
            })
            .toUpperCase(),
        },
      );
    } else {
      displayLabel = intl.formatMessage({ ...messages.subscribe });
    }
    let messageKey;
    let defaultOption;
    if (this.props.targetType === 'DISCUSSION') {
      messageKey = 'REPLIES';
      defaultOption = 'REPLIES';
    } else {
      messageKey = 'UPDATES';
      defaultOption = 'UPDATES';
    }

    const options = [];
    if (subscription) {
      options.push({
        label: intl.formatMessage({
          ...messages.delete,
        }),
        value: 'DELETE',
      });
    }
    options.push(
      {
        label: intl.formatMessage({
          ...messages.ALL,
        }),
        value: 'ALL',
      },
      {
        label: intl.formatMessage({
          ...messages.FOLLOWEES,
        }),
        value: 'FOLLOWEES',
      },
      {
        label: intl.formatMessage({
          ...messages[messageKey],
        }),
        value: defaultOption,
      },
    );

    return (
      <Box>
        {status.error}
        <Select
          options={options}
          onSearch={false}
          value={{
            label: displayLabel,
            value:
              (subscription && subscription.subscriptionType) ||
              this.state.value,
          }}
          onChange={this.handleValueChange}
        />
      </Box>
    );
  }
}

export default withStyles(s)(injectIntl(SubscriptionButton));
