import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GroupsPage.css';
import Box from '../../components/Box';
import { getGroups, getGroup } from '../../reducers';

import AssetsTable from '../../components/AssetsTable';
import GroupRow from './GroupRow';
import history from '../../history';

class GroupsPage extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf({}),
    group: PropTypes.shape({ subGroups: PropTypes.shape({}) }),
    id: PropTypes.string,
  };

  static defaultProps = {
    id: null,
    group: null,
    groups: null,
  };

  // eslint-disable-next-line
  onGroupClick(action, { id }) {
    if (action === 'SHOW') {
      if (id) {
        history.push(`/group/${id}/`);
      }
    }
  }

  render() {
    const groups = this.props.id
      ? this.props.group.subGroups
      : this.props.groups;

    return (
      <Box>
        <AssetsTable
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.onGroupClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={groups || []}
          row={GroupRow}
          tableHeaders={['', 'name', 'subgroups', '', '']}
        />
      </Box>
    );
  }
}
const mapStateToProps = (state, { id }) => ({
  groups: getGroups(state),
  group: getGroup(state, id),
});
export default connect(mapStateToProps)(withStyles(s)(GroupsPage));
