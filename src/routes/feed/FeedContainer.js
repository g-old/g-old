import React from 'react';
import withstyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import { connect } from 'react-redux';
import { loadFeed } from '../../actions/posts';
import { getAllPosts, getPostsStatus } from '../../reducers';
import s from './FeedContainer.css';
import FetchError from '../../components/FetchError';
import Post from '../../components/Post';
import { type tPostType } from '../../data/types/PostType';

// @flow
type Props = {
  posts: [tPostType],
  status: { error: string, pending: boolean },
  loadFeed: () => void,
};

class FeedContainer extends React.Component<Props> {
  static defaultProps = {
    status: null,
  };
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.posts != null;
  }

  render() {
    const { posts, status: { error, pending } }: Props = this.props;

    if (pending && !posts.length) {
      return <p> Loading ... </p>;
    }

    if (error && !posts.length) {
      return (
        <FetchError message={error} onRetry={() => this.props.loadFeed()} />
      );
    }

    return (
      <div className={cn(s.container)}>
        {posts.map(post => (
          /* console.log('post.subject', post.subject); */
          <Post subject={post.subject} group={post.group} key={post.id} />
        ))}
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = state => ({
  posts: getAllPosts(state),
  status: getPostsStatus(state),
  locale: state.intl.locale,
});

const mapDispatch = {
  loadFeed,
};

export default connect(mapStateToProps, mapDispatch)(
  withstyles(s)(FeedContainer),
);
