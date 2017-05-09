import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Activity.css';
import Avatar from '../Avatar';
import Statement from '../Statement';
import ProposalPreview from '../ProposalPreview';
import Icon from '../Icon';

class Activity extends React.Component {
  static propTypes = {
    content: PropTypes.shape({
      __typename: PropTypes.string,
      voter: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        surname: PropTypes.string,
      }),
    }).isRequired,
    verb: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  };

  render() {
    let content = null;
    let header = null;
    /* eslint-disable no-underscore-dangle */
    if (this.props.content.__typename === 'StatementDL') {
      content = <Statement data={this.props.content} />;
      header = 'Look at that statement!';
    } else if (this.props.content.__typename === 'ProposalDL') {
      content = <ProposalPreview proposal={this.props.content} />;
      if (this.props.verb === 'create') {
        header = 'NEW Proposal!';
      } else if (this.props.verb === 'close') {
        header = 'Soon closing!';
      } else if (this.props.verb === 'accept') {
        header = 'This voting has been accepted!';
      } else if (this.props.verb === 'reject') {
        header = 'This proposal is now valid!';
      }
    } else if (this.props.content.__typename === 'VoteDL') {
      content = (
        <div>
          <Avatar user={this.props.content.voter} isFollowee />
          {`${this.props.content.voter.name} ${this.props.content.voter.surname}`}
          <br />
          <Icon icon={'M27 4l-15 15-7-7-5 5 12 12 20-20z'} color={'green'} size={'64'} />
        </div>
      );
      header = 'Just voted!';
    } else {
      content = JSON.stringify(this.props.content);
      header = 'Nobody knows ...';
    }
    /* eslint-enable no-underscore-dangle */

    return (
      <div className={s.container}>
        <FormattedRelative value={this.props.date} />
        <h1>{header}</h1>

        <div>
          {content}

        </div>
      </div>
    );
  }
}

export default withStyles(s)(Activity);
