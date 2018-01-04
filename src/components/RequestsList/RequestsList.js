import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RequestsList.css'; // eslint-disable-line
import Box from '../Box';
import Table from '../Table';
import RequestTableRows from './Rows';
import TableHeader from '../TableHeader';

class RequestsList extends React.Component {
  static propTypes = {
    requests: PropTypes.arrayOf(PropTypes.shape({})),
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
    noRequestsFound: PropTypes.node,
    checkedIndices: PropTypes.arrayOf(PropTypes.number),
  };
  static defaultProps = {
    requests: null,
    sortIndex: null,
    requiresSearch: null,
    searchTerm: null,
    sortAscending: null,
    onSort: null,
    //  onMore: null,
    onClickMenu: null,
    onClickCheckbox: null,
    allowMultiSelect: null,
    noRequestsFound: null,
    checkedIndices: null,
  };

  render() {
    const {
      requests,
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
      noRequestsFound,
      checkedIndices,
    } = this.props;
    return (
      <div className={s.table}>
        <Box>
          {!requests.length && noRequestsFound !== null ? (
            noRequestsFound
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
              <RequestTableRows
                checkedIndices={checkedIndices}
                requests={requests}
                searchTerm={searchTerm}
                requiresSearch={requiresSearch}
                onClickCheckbox={onClickCheckbox}
                onClickMenu={onClickMenu}
                allowMultiSelect={allowMultiSelect}
              >
                {noRequestsFound}
              </RequestTableRows>
            </Table>
          )}
        </Box>
      </div>
    );
  }
}

export default withStyles(s)(RequestsList);
