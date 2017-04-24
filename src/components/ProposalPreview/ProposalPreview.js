import { FormattedRelative } from 'react-intl';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import Link from '../Link';
import { thresholdPassed } from '../../core/helpers';
// import { DOMParser } from 'xmldom';

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
      tags: PropTypes.arrayOf(PropTypes.object).isRequired,
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
      poll = thresholdPassed(this.props.proposal.pollOne)
        ? this.props.proposal.pollTwo
        : this.props.proposal.pollOne;
    } else if (
      this.props.proposal.state === 'rejected' || this.props.proposal.state === 'revoked'
    ) {
      poll = thresholdPassed(this.props.proposal.pollOne)
        ? this.props.proposal.pollTwo
        : this.props.proposal.pollOne;
    }
    const body = null; /* eslint-disable jsx-a11y/no-static-element-interactions */
    // Disabled bc Nodejs Domparser (xmldom) has dep problems
    /*  if (this.state.fullText) {
      body = this.props.proposal.body;
    } else {
      body = `${new DOMParser()
        .parseFromString(this.props.proposal.body, 'text/html')
        .documentElement.textContent.substring(0, 100)}( ... )`;
        // `${this.props.proposal.body.substring(0, 100)} (...)`;
    } */ return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.date}>
            <FormattedRelative value={this.props.proposal.publishedAt} />
          </div>
          <Link to={`/testproposal/${this.props.proposal.id}`}>
            <div className={s.title}>
              {this.props.proposal.title}
            </div>
          </Link>
          <div
            className={s.body}
            onClick={() => {
              this.setState({ fullText: !this.state.fullText });
            }}
          >
            {body}
          </div>
          <div className={s.pollState}>
            <PollState
              compact
              allVoters={poll.allVoters}
              upvotes={poll.upvotes}
              downvotes={poll.downvotes}
              threshold_ref={poll.mode.threshold_ref}
              threshold={poll.threshold}
              unipolar={poll.mode.unipolar}
            />
          </div>
          {'TAGS :'}
          <div className={s.tags}>
            {this.props.proposal.tags &&
              this.props.proposal.tags.map(tag => <span className={s.tag}>{`${tag.text}`}</span>)}
          </div>

        </div>

      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(Proposal);
