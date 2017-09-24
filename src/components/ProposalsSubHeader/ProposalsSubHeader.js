import React from 'react';
import PropTypes from 'prop-types';
import Select from '../Select';
import history from '../../history';

class ProposalsSubHeader extends React.Component {
  static propTypes = {
    filter: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
        <span style={{ maxWidth: '10em' }}>
          <Select
            value={this.props.filter}
            onChange={e => {
              history.push(`/proposals/${e.option}`);
            }}
            options={['active', 'accepted', 'repelled']}
          />
        </span>
      </div>
    );
  }
}

export default ProposalsSubHeader;
