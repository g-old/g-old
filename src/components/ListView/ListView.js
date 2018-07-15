import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ListView.css';
import Box from '../Box';
import Button from '../Button';
import FetchError from '../FetchError';
import List from '../List';
import Card from '../Card';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});
class ListView extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onLoadMore: PropTypes.func.isRequired,
    onRetry: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({
      pagination: PropTypes.shape({ endCursor: PropTypes.string }),
    }).isRequired,
    isFetching: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
  };

  static defaultProps = { errorMessage: null };

  constructor(props) {
    super(props);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  handleLoadMore() {
    const { onLoadMore, pageInfo } = this.props;
    onLoadMore({
      after: pageInfo.pagination.endCursor,
    });
  }

  renderChildren() {
    const { children } = this.props;
    return React.Children.map(children, child => (
      <div>
        <Card>{child} </Card>
      </div>
    ));
  }

  render() {
    const {
      children,
      pageInfo: { pending, errorMessage, pagination },
      onRetry,
    } = this.props;
    if (pending && !children.length) {
      return (
        <div>
          <p> Loading ... </p>
        </div>
      );
    }

    if (errorMessage && !children.length) {
      return (
        <div>
          <FetchError
            isFetching={pending}
            message={errorMessage}
            onRetry={onRetry}
          />
        </div>
      );
    }
    return (
      <Box column>
        <List>{this.renderChildren()}</List>
        {pagination.hasNextPage && (
          <Button
            primary
            disabled={pending}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </Box>
    );
  }
}

export default withStyles(s)(ListView);
