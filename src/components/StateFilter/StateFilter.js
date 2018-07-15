import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './StateFilter.css';

import Select from '../Select';

const messages = defineMessages({
  active: {
    id: 'resource.active',
    defaultMessage: 'active',
    description: 'Filter for active proposals/surveys/discussions',
  },
  closed: {
    id: 'resource.closed',
    defaultMessage: 'closed',
    description: 'Filter for closed proposals/surveys/discussions',
  },
  accepted: {
    id: 'proposals.accepted',
    defaultMessage: 'accepted',
    description: 'Filter for accepted proposals',
  },
  repelled: {
    id: 'proposals.repelled',
    defaultMessage: 'repelled',
    description: 'Filter for repelled proposals',
  },
});

const StateFilter = ({ states, onChange, filter, intl }) => (
  <div className={s.root}>
    <span className={s.filter}>
      <Select
        value={intl.formatMessage(messages[filter])}
        onChange={onChange}
        options={states.map(state => ({
          value: state,
          label: intl.formatMessage(messages[state]),
        }))}
      />
    </span>
  </div>
);

StateFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  states: PropTypes.oneOfType(['active', 'closed', 'accepted', 'repelled'])
    .isRequired,
};

export default withStyles(s)(injectIntl(StateFilter));
