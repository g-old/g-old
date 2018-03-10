import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GroupsList.css'; // eslint-disable-line
import Box from '../Box';
import Table from '../Table';
import GroupTableRows from './Rows';
import TableHeader from '../TableHeader';

class GroupsList extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({})),
    sortIndex: PropTypes.string,
    requiresSearch: PropTypes.bool,
    searchTerm: PropTypes.string,
    sortAscending: PropTypes.bool,
    onSort: PropTypes.func,
    // onMore: PropTypes.func,
    onClickMenu: PropTypes.func,
    tableHeaders: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClickCheckbox: PropTypes.func,
    allowMultiSelect: PropTypes.bool,
    noGroupsFound: PropTypes.node,
    checkedIndices: PropTypes.arrayOf(PropTypes.number),
  };
  static defaultProps = {
    groups: null,
    sortIndex: null,
    requiresSearch: null,
    searchTerm: null,
    sortAscending: null,
    onSort: null,
    //  onMore: null,
    onClickMenu: null,
    onClickCheckbox: null,
    allowMultiSelect: null,
    noGroupsFound: null,
    checkedIndices: null,
  };

  render() {
    const {
      groups,
      sortIndex,
      requiresSearch,
      searchTerm,
      sortAscending,
      onSort,
      //  onMore,
      onClickMenu,
      tableHeaders,
      onClickCheckbox,
      allowMultiSelect,
      noGroupsFound,
      checkedIndices,
    } = this.props;
    return (
      <div className={s.table}>
        <Box>
          {!groups.length && noGroupsFound !== null ? (
            noGroupsFound
          ) : (
            <Table responsive scrollable={false}>
              <TableHeader
                sortIndex={sortIndex}
                sortAscending={sortAscending}
                onSort={onSort}
                labels={
                  allowMultiSelect
                    ? tableHeaders
                    : tableHeaders.slice(0, tableHeaders.length - 1)
                }
              />
              <GroupTableRows
                checkedIndices={checkedIndices}
                groups={groups}
                searchTerm={searchTerm}
                requiresSearch={requiresSearch}
                onClickCheckbox={onClickCheckbox}
                onClickMenu={onClickMenu}
                allowMultiSelect={allowMultiSelect}
              >
                {noGroupsFound}
              </GroupTableRows>
            </Table>
          )}
        </Box>
      </div>
    );
  }
}

export default withStyles(s)(GroupsList);
