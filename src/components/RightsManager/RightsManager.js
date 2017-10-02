import React from 'react';
import PropTypes from 'prop-types';
import {
  Permissions,
  PermissionsSchema,
  Groups,
  Privileges,
  PrivilegesSchema,
} from '../../organization';
import Box from '../Box';
import Label from '../Label';

import CheckBox from '../CheckBox';

/* eslint-disable no-bitwise */
const filterRights = (rights, ruleSet) =>
  Object.keys(ruleSet).reduce((acc, curr) => {
    if (rights & ruleSet[curr]) {
      acc.push(curr);
    }
    return acc;
  }, []);

const extractRights = groups =>
  Object.keys(Groups).reduce((acc, curr) => {
    const r = Groups[curr];
    if (groups & r) {
      acc.push({
        group: curr,
        rights: filterRights(PermissionsSchema[r], Permissions).concat(
          filterRights(PrivilegesSchema[r], Privileges),
        ),
      });
    }
    return acc;
  }, []);
/* eslint-enable no-bitwise */

const renderGroup = data => (
  <div>
    <Label>{data.group}</Label>
    <div style={{ display: 'grid', marginTop: '0.5em' }}>
      {data.rights.map(r => (
        <div style={{ marginBottom: '0.2em' }}>
          <CheckBox disabled label={r} checked name={r} />
        </div>
      ))}
    </div>
  </div>
);
class RightsManager extends React.Component {
  static propTypes = {
    account: PropTypes.shape({
      groups: PropTypes.number,
    }).isRequired,
  };

  static defaultProps = {
    updates: {},
  };
  constructor(props) {
    super(props);
    this.allRights = extractRights(props.account.groups);
  }

  componentWillReceiveProps({ account }) {
    if (account.groups !== this.props.account.groups) {
      this.allRights = extractRights(account.groups);
    }
  }

  render() {
    return (
      <Box column pad>
        {this.allRights.map(data => renderGroup(data))}
      </Box>
    );
  }
}

export default RightsManager;
