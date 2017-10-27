import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalPreview from '../../components/ProposalPreview';
import Button from '../../components/Button';
import s from './ProposalListView.css';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});
class ProposalListView extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    onLoadMore: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    pageInfo: PropTypes.shape({
      endCursor: PropTypes.string,
      hasNextPage: PropTypes.bool,
    }).isRequired,
    filter: PropTypes.string.isRequired,
    tagId: PropTypes.string.isRequired,
    onProposalClick: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  handleLoadMore() {
    this.props.onLoadMore({
      state: this.props.filter,
      after: this.props.pageInfo.endCursor,
      ...(this.props.tagId && { tagId: this.props.tagId }),
    });
  }
  render() {
    const { proposals, pageInfo, isFetching, onProposalClick } = this.props;

    return (
      <div>
        <div className={s.list}>
          {proposals.map(proposal => (
            <ProposalPreview
              key={proposal.id}
              proposal={proposal}
              onClick={onProposalClick}
            />
          ))}
        </div>
        {pageInfo.hasNextPage && (
          <Button
            primary
            disabled={isFetching}
            onClick={this.handleLoadMore}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </div>
    );
  }
}

export default withStyles(s)(ProposalListView);
