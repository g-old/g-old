import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ProposalPreview from '../../components/ProposalPreview';
import { loadProposalsList } from '../../actions/proposal';
import {
  getProposalsByTag,
  getTag,
  getTags,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getPageInfo,
} from '../../reducers/index';
import Button from '../../components/Button';
import FetchError from '../../components/FetchError';
import Tag from '../../components/Tag';
import Search from '../../components/Search';

const messages = defineMessages({
  loadMore: {
    id: 'command.loadMore',
    defaultMessage: 'Load more',
    description: 'To get more data',
  },
});
class ProposalContainer extends React.Component {
  static propTypes = {
    proposals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ).isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    errorMessage: PropTypes.string.isRequired,
    pageInfo: PropTypes.shape({
      endCursor: PropTypes.string,
      hasNextPage: PropTypes.bool,
    }).isRequired,
    tag: PropTypes.shape({ text: PropTypes.string }).isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string }))
      .isRequired,
    tagId: PropTypes.string.isRequired,
  };
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.proposals != null;
  }

  render() {
    const {
      proposals,
      isFetching,
      errorMessage,
      tag,
      tags,
      tagId,
    } = this.props;
    if (isFetching && !proposals.length) {
      return (
        <div>
          <p> Loading ... </p>
        </div>
      );
    }

    if (errorMessage && !proposals.length) {
      return (
        <div>
          <FetchError
            isFetching={isFetching}
            message={errorMessage}
            onRetry={() =>
              this.props.loadProposalsList({
                state: 'all',
                tagId,
              })}
          />
        </div>
      );
    }
    return (
      <div>
        <h1> Tagged proposals</h1>
        <Search
          value={tag.text}
          suggestions={tags && tags.map(t => t.text)}
          onSelect={() => alert('TO IMPLEMENT')}
        />
        <div style={{ display: 'flex', fontSize: '0.8em', paddingTop: '1em' }}>
          <Tag text={`${tag.text} (${tag.count})`} />
        </div>

        {proposals.map(proposal => (
          <ProposalPreview key={proposal.id} proposal={proposal} />
        ))}
        {this.props.pageInfo.hasNextPage && (
          <Button
            primary
            disabled={isFetching}
            onClick={() => {
              this.props.loadProposalsList({
                state: 'all',
                after: this.props.pageInfo.endCursor,
                tagId,
              });
            }}
            label={<FormattedMessage {...messages.loadMore} />}
          />
        )}
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, ownProps) => ({
  proposals: getProposalsByTag(state, ownProps.tagId),
  tag: getTag(state, ownProps.tagId),
  tags: getTags(state),
  isFetching: getProposalsIsFetching(state, 'all'),
  errorMessage: getProposalsErrorMessage(state, 'all'),
  pageInfo: getPageInfo(
    state,
    `${'all$'}${ownProps.tagId}`,
  ) /* getProposalsPage(state, 'active') */,
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(ProposalContainer);
