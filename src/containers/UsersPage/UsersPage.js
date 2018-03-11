import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UsersPage.css';
import Box from '../../components/Box';

import AssetsTable from '../../components/AssetsTable';
import UserRow from './UserRow';

class UsersPage extends React.Component {
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
          row={UserRow}
          tableHeaders={['', 'name', 'surname', 'closed at', '', '']}
        />
      </Box>
    );
  }
}

export default withStyles(s)(UsersPage);
