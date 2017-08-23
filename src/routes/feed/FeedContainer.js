import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadFeed } from '../../actions/feed';
import {
  getActivities,
  getFeedIsFetching,
  getFeedErrorMessage,
} from '../../reducers/index';
import FetchError from '../../components/FetchError';
import Activity from '../../components/Activity';

class FeedContainer extends React.Component {
  static propTypes = {
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
      })
    ).isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadFeed: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
  };

  static defaultProps = {
    errorMessage: '',
  };
  isReady() {
    // Probably superflue bc we are awaiting the LOAD_PROPOSAL_xxx flow
    return this.props.activities != null;
  }

  render() {
    const { activities, isFetching, errorMessage } = this.props;
    if (isFetching && !activities.length) {
      return <p> Loading ... </p>;
    }

    if (errorMessage && !activities.length) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => this.props.loadFeed()}
        />
      );
    }

    const outDated = {};
    const polls = {};
    const proposals = {};
    return (
      <div>
        <h1>feed</h1>
        {activities.map(activity => {
          if (!activity.object) return null; // hotfix - problem is ondelete cascade for votes
          if (activity.type === 'statement') {
            if (activity.verb === 'update') {
              if (activity.objectId in outDated) {
                return null;
              }
              if (
                activity.object.pollId in polls &&
                activity.object.author.id === polls[activity.object.pollId]
              ) {
                return null;
              }
              outDated[activity.objectId] = activity.objectId;
              polls[activity.object.pollId] = activity.object.author.id;
            } else if (activity.verb === 'delete') {
              outDated[activity.objectId] = activity.object.author.id;
              polls[activity.object.pollId] = activity.object.author.id;

              return null;
            } else if (activity.objectId in outDated) {
              return null;
            } else if (activity.verb === 'create') {
              if (activity.object) {
                if (
                  activity.object.pollId in outDated &&
                  activity.object.author.id === outDated[activity.object.pollId]
                ) {
                  return null;
                }
                if (
                  activity.object.pollId in polls &&
                  activity.object.author.id === polls[activity.object.pollId]
                ) {
                  return null;
                }
                outDated[activity.object.pollId] = activity.object.author.id;
              } else {
                return null;
              }
            }
          } else if (activity.type === 'proposal') {
            if (activity.objectId in proposals) {
              return null;
            }
            proposals[activity.objectId] = activity.objectId;
          }

          return (
            <Activity
              key={activity.id}
              actor={activity.actor}
              date={activity.createdAt}
              verb={activity.verb}
              content={activity.object}
            />
          );
        })}
      </div>
    );
  }
}
// TODO implement memoiziation with reselect
const mapStateToProps = state => ({
  activities: getActivities(state, 'all'),
  isFetching: getFeedIsFetching(state, 'all'),
  errorMessage: getFeedErrorMessage(state, 'all'),
});

const mapDispatch = {
  loadFeed,
};

export default connect(mapStateToProps, mapDispatch)(FeedContainer);
