import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './VotesList.css';

class VotesList extends React.Component {
  static propTypes = {
    unipolar: PropTypes.bool.isRequired,
    votes: PropTypes.arrayOf(PropTypes.object),
    getVotes: PropTypes.func.isRequired,
    autoLoadVotes: PropTypes.bool,
  };

  static renderVote(vote) {
    return (
      <img
        key={vote.id}
        style={{ width: '2em', height: '2em', margin: '2px' }}
        src={`https://api.adorable.io/avatars/32/${vote.voter.name}${vote.voter.surname}.io.png`}
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
        if (vote.position === 'pro') pro.push(vote);
        else con.push(vote);
      });
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
