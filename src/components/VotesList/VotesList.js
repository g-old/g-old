import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './VotesList.css';
import FetchError from '../FetchError';

class VotesList extends React.Component {
  static propTypes = {
    unipolar: PropTypes.bool.isRequired,
    votes: PropTypes.arrayOf(PropTypes.object),
    getVotes: PropTypes.func.isRequired,
    autoLoadVotes: PropTypes.bool,
    isFetching: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
  };

  static renderVote(vote) {
    return (
      <img
        key={vote.id}
        style={{ width: '2em', height: '2em', margin: '2px' }}
        src={`https://api.adorable.io/avatars/256/${vote.voter.name}${vote.voter.surname}.io.png`}
        title={`${vote.voter.name} ${vote.voter.surname}`}
        alt="IMG"
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
    this.setState({ ...this.state, showVotes: true });
    this.props.getVotes();
  }

  render() {
    const pro = [];
    const con = [];
    if (this.state.showVotes && this.props.votes) {
      this.props.votes.forEach(vote => {
        // TODO check why votes are undefined when ownvote is deleted
        if (vote && vote.position === 'pro') pro.push(vote);
        else con.push(vote);
      });
    }

    const { isFetching, errorMessage } = this.props;
    if (isFetching && !(pro.length || con.length)) {
      return <p>{'Loading...'} </p>;
    }
    if (errorMessage && !(pro.length || con.length)) {
      return <FetchError message={errorMessage} onRetry={this.props.getVotes} />;
    }
    return (
      <div>
        {this.state.showVotes
          ? <div className={cn(!this.props.unipolar && s.bipolar)}>
            <div className={cn(s.votes)}>
              {pro.map(vote => VotesList.renderVote(vote))}
            </div>
            {!this.props.unipolar &&
            <div className={cn(s.votes, s.con)}>
              {con.map(vote => VotesList.renderVote(vote))}
            </div>}
          </div>
          : <button onClick={this.onGetVotes}> GETVOTES</button>}
      </div>
    );
  }
}

export default withStyles(s)(VotesList);
