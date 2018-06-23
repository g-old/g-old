import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProposalsList } from '../../actions/proposal';
import {
  getProposalsByTag,
  getTag,
  getTags,
  getProposalsIsFetching,
  getProposalsErrorMessage,
  getPageInfo,
} from '../../reducers/index';
import ProposalPreview from '../../components/ProposalPreview';
import ListView from '../../components/ListView';

import FetchError from '../../components/FetchError';
import Tag from '../../components/Tag';
// import Search from '../../components/Search';
import history from '../../history';

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
    /* tags: PropTypes.arrayOf(PropTypes.shape({ displayName: PropTypes.string }))
      .isRequired, */
    tagId: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.handleOnRetry = this.handleOnRetry.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  handleProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }
  handleLoadMore({ after }) {
    this.props.loadProposalsList({
      after,
      state: 'all',
    });
  }

  handleOnRetry() {
    this.props.loadProposalsList({
      state: 'all',
    });
  }

  render() {
    const {
      proposals,
      isFetching,
      errorMessage,
      tag,
      pageInfo,
      // tags,
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
              })
            }
          />
        </div>
      );
    }
    return (
      <div>
        <h1> Tagged proposals</h1>
        {/* <Search
          value={tag.text}
          suggestions={tags && tags.map(t => t.displayName)}
          onSelect={() => alert('TO IMPLEMENT')}
        /> */}
        <div style={{ display: 'flex', fontSize: '0.8em', paddingTop: '1em' }}>
          <Tag text={`${tag.displayName} (${tag.count})`} />
        </div>
        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {proposals.map(
            s =>
              s && (
                <ProposalPreview
                  proposal={s}
                  onClick={this.handleProposalClick}
                />
              ),
          )}
        </ListView>
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = (state, ownProps) => ({
  proposals: getProposalsByTag(state, ownProps.tagId),
  tag: getTag(state, ownProps.tagId),
  tags: getTags(state),
  pageInfo: {
    pagination: getPageInfo(state, `${'all$'}${ownProps.tagId}`),
    pending: getProposalsIsFetching(state, 'all'),
    errorMessage: getProposalsErrorMessage(state, 'all'),
  },
});

const mapDispatch = {
  loadProposalsList,
};

export default connect(mapStateToProps, mapDispatch)(ProposalContainer);
