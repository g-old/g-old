import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './VotesList.css';
import FetchError from '../FetchError';
import history from '../../history';
import Avatar from '../Avatar';

const onThumbnailClick = (event, id) => {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
    if (id) {
      history.push(`/accounts/${id}`);
    }
  }
};

class VotesList extends React.Component {
  static propTypes = {
    unipolar: PropTypes.bool.isRequired,
    votes: PropTypes.arrayOf(PropTypes.object),
    getVotes: PropTypes.func.isRequired,
    autoLoadVotes: PropTypes.bool,
    isFetching: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
  };

  static defaultProps = {
    autoLoadVotes: false,
    errorMessage: null,
    votes: null,
  };

  static renderVote(vote) {
    return (
      <Avatar
        user={vote.voter}
        className={s.avatar}
        onClick={e => {
          onThumbnailClick(e, vote.voter.id);
        }}
      />
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      showVotes: props.autoLoadVotes,
    };
    this.onGetVotes = this.onGetVotes.bind(this);
  }

  onGetVotes() {
    const { getVotes } = this.props;
    this.setState({ showVotes: true });
    getVotes();
  }

  render() {
    const pro = [];
    const con = [];
    const { unipolar, votes = [], getVotes } = this.props;
    const { showVotes } = this.state;
    if (showVotes && votes) {
      if (unipolar) {
        pro.push(...votes);
      } else {
        votes.forEach(vote => {
          if (vote && vote.positions[0].pos === 0 && vote.positions[0].value)
            pro.push(vote);
          else con.push(vote);
        });
      }
    }

    const { isFetching, errorMessage } = this.props;
    if (isFetching && (!votes || !votes.length)) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && (!votes || !votes.length)) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={e => {
            e.stopPropagation();
            getVotes();
          }}
        />
      );
    }
    /* eslint-disable css-modules/no-undef-class */
    return (
      <div>
        {showVotes ? (
          <div className={cn(!unipolar && s.bipolar)}>
            <div className={cn(s.votes)}>
              {pro.map(vote => VotesList.renderVote(vote))}
            </div>
            {!unipolar && (
              <div className={cn(s.votes, s.con)}>
                {con.map(vote => VotesList.renderVote(vote))}
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={this.onGetVotes}>
            GETVOTES
          </button>
        )}
      </div>
    );
    /* eslint-enable css-modules/no-undef-class */
  }
}

export default withStyles(s)(VotesList);
