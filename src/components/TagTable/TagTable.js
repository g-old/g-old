import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TagTable.css'; // eslint-disable-line
import Box from '../Box';
import Table from '../Table';
import TagTableRows from './Rows';
import TableHeader from '../TableHeader';

class TagsList extends React.Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.shape({})),
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
    noTagsFound: PropTypes.node,
    checkedIndices: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    tags: null,
    sortIndex: null,
    requiresSearch: null,
    searchTerm: null,
    sortAscending: null,
    onSort: null,
    //  onMore: null,
    onClickMenu: null,
    onClickCheckbox: null,
    allowMultiSelect: null,
    noTagsFound: null,
    checkedIndices: null,
  };

  render() {
    const {
      tags = [],
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
      noTagsFound,
      checkedIndices,
    } = this.props;
    return (
      <div className={s.table}>
        <Box>
          {!tags.length && noTagsFound !== null ? (
            noTagsFound
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
              <TagTableRows
                checkedIndices={checkedIndices}
                tags={tags}
                searchTerm={searchTerm}
                requiresSearch={requiresSearch}
                onClickCheckbox={onClickCheckbox}
                onClickMenu={onClickMenu}
                allowMultiSelect={allowMultiSelect}
              >
                {noTagsFound}
              </TagTableRows>
            </Table>
          )}
        </Box>
      </div>
    );
  }
}

export default withStyles(s)(TagsList);
