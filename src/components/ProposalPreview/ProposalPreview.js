import { FormattedRelative } from 'react-intl';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import Link from '../Link';

class Proposal extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      publishedAt: PropTypes.string,
      pollOne: PropTypes.object,
      pollTwo: PropTypes.object,
    }),
  };
  constructor(props) {
    super(props);
    this.state = { fullText: false };
  }

  render() {
    let poll = null;
    if (this.props.proposal.state === 'proposed') {
      poll = this.props.proposal.pollOne;
    } else if (this.props.proposal.state === 'voting') {
      poll = this.props.proposal.pollTwo;
    } else if (this.props.proposal.state === 'accepted') {
      // TODO how should we decide which poll has to be displayed
      poll = this.props.proposal.pollOne;
    }
    let body = '';
    if (this.state.fullText) {
      body = this.props.proposal.body;
    } else {
      body = `${this.props.proposal.body.substring(0, 100)} (...)`;
    }
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Link to={`/testproposal/${this.props.proposal.id}`}>
            <div className={s.title}>
              {this.props.proposal.title}
            </div>
          </Link>
          <div className={s.date}>
            <FormattedRelative value={this.props.proposal.publishedAt} />
          </div>
          <div
            className={s.body}
            onClick={() => {
              this.setState({ fullText: !this.state.fullText });
            }}
          >
            {body}
          </div>
          <PollState
            allVoters={poll.allVoters}
            upvotes={poll.upvotes}
            downvotes={poll.downvotes}
            threshold_ref={poll.mode.threshold_ref}
            threshold={poll.threshold}
            unipolar={poll.mode.unipolar}
          />
        </div>

      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(Proposal);