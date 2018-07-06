import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WorkTeamPanel.css';
import Box from '../Box';
import { loadWorkTeams } from '../../actions/workTeam';
import { getWorkTeams } from '../../reducers';
import history from '../../history';
import AssetsTable from '../AssetsTable';
import WorkteamRow from './WorkteamRow';
import Button from '../Button';

class WorkTeamPanel extends React.Component {
  static propTypes = {
    loadWorkTeams: PropTypes.func.isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  componentDidMount() {
    const { loadWorkTeams: fetchWorkTeams } = this.props;
    fetchWorkTeams();
  }

  // eslint-disable-next-line class-methods-use-this
  onMenuClick(action, data) {
    if (action === 'SHOW') {
      history.push(`/workteams/${data.id}/admin`);
    } else if (action === 'EDIT') {
      history.push(`/workteams/${data.id}/edit`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onAdd() {
    history.push('/admin/workteam/create');
  }

  render() {
    const { workTeams = [] } = this.props;

    return (
      <Box column>
        <Box>
          <Button icon="+" onClick={this.onAdd}>
            {'Add Workteam'}
          </Button>
        </Box>
        <AssetsTable
          onClickMenu={this.onMenuClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound="No requests found"
          checkedIndices={[]}
          assets={workTeams || []}
          row={WorkteamRow}
          tableHeaders={[
            'name',
            'coordinator',
            'restricted',
            'members',
            'status',
            'discussions',
            '',
          ]}
        />
      </Box>
    );
  }
}
const mapStateToProps = state => ({
  workTeams: getWorkTeams(state),
});

const mapDispatch = {
  loadWorkTeams,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(WorkTeamPanel));
