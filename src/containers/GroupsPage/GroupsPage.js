import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GroupsPage.css';
import Box from '../../components/Box';

import AssetsTable from '../../components/AssetsTable';
import GroupRow from './GroupRow';

class GroupsPage extends React.Component {
  static propTypes = {};

  render() {
    return (
      <Box>
        <AssetsTable
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.onProposalClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={[]}
          row={GroupRow}
          tableHeaders={['', 'name', 'subgroups', '', '']}
        />
      </Box>
    );
  }
}

export default withStyles(s)(GroupsPage);
