import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadFeed } from '../../actions/feed';
import { getActivities, getFeedIsFetching, getFeedErrorMessage } from '../../reducers/index';
import FetchError from '../../components/FetchError';
import Activity from '../../components/Activity';

class FeedContainer extends React.Component {
  static propTypes = {
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
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
      return <FetchError message={errorMessage} onRetry={() => this.props.loadFeed()} />;
    }

    const outDated = {};
    return (
      <div>
        <h1>feed</h1>
        {activities.map((activity) => {
          if (activity.type === 'statement') {
            if (activity.verb === 'update') {
              outDated[activity.objectId] = activity.objectId;
            } else if (activity.verb === 'delete') {
              outDated[activity.objectId] = activity.objectId;
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
                outDated[activity.object.pollId] = activity.object.author.id;
              } else {
                return null;
              }
            }
          }

          return (
            <Activity
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
  activities: getActivities(state),
  isFetching: getFeedIsFetching(state),
  errorMessage: getFeedErrorMessage(state),
});

const mapDispatch = {
  loadFeed,
};

export default connect(mapStateToProps, mapDispatch)(FeedContainer);
