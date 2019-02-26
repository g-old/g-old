import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './WorkTeamsList.css'; // eslint-disable-line
import Box from '../Box';
import Table from '../Table';
import WorkTeamTableRows from './Rows';
import TableHeader from '../TableHeader';

class WorkTeamsList extends React.Component {
  static propTypes = {
    workTeams: PropTypes.arrayOf(PropTypes.shape({})),
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
    noWorkTeamsFound: PropTypes.node,
    checkedIndices: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    workTeams: null,
    sortIndex: null,
    requiresSearch: null,
    searchTerm: null,
    sortAscending: null,
    onSort: null,
    //  onMore: null,
    onClickMenu: null,
    onClickCheckbox: null,
    allowMultiSelect: null,
    noWorkTeamsFound: null,
    checkedIndices: null,
  };

  render() {
    const {
      workTeams,
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
      noWorkTeamsFound,
      checkedIndices,
    } = this.props;
    return (
      <div className={s.table}>
        <Box>
          {!workTeams.length && noWorkTeamsFound !== null ? (
            noWorkTeamsFound
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
              <WorkTeamTableRows
                checkedIndices={checkedIndices}
                workTeams={workTeams}
                searchTerm={searchTerm}
                requiresSearch={requiresSearch}
                onClickCheckbox={onClickCheckbox}
                onClickMenu={onClickMenu}
                allowMultiSelect={allowMultiSelect}
              >
                {noWorkTeamsFound}
              </WorkTeamTableRows>
            </Table>
          )}
        </Box>
      </div>
    );
  }
}

export default withStyles(s)(WorkTeamsList);
