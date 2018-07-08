import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WorkTeamPanel.css';
import Box from '../Box';
import {
  loadWorkTeams,
  updateWorkTeam,
  deleteWorkteam,
} from '../../actions/workTeam';
import { getWorkTeams, getWorkTeamStatus } from '../../reducers';
import history from '../../history';
import AssetsTable from '../AssetsTable';
import WorkteamRow from './WorkteamRow';
import Button from '../Button';
import ConfirmLayer from '../ConfirmLayer';

class WorkTeamPanel extends React.Component {
  static propTypes = {
    loadWorkTeams: PropTypes.func.isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    updateWorkTeam: PropTypes.func.isRequired,
    deleteWorkteam: PropTypes.func.isRequired,
    updates: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.onMenuClick = this.onMenuClick.bind(this);
    this.onToggleLayer = this.onToggleLayer.bind(this);
    this.onMutate = this.onMutate.bind(this);
  }

  componentDidMount() {
    const { loadWorkTeams: fetchWorkTeams } = this.props;
    fetchWorkTeams();
  }

  componentDidUpdate({ updates }) {
    const { updates: newUpdates } = this.props;
    if (newUpdates.success && !updates.success) {
      this.onToggleLayer();
    }
  }

  onToggleLayer() {
    this.setState(prevState => ({ showLayer: !prevState.showLayer }));
  }

  // eslint-disable-next-line class-methods-use-this
  onMenuClick(action, data) {
    switch (action) {
      case 'SHOW':
        history.push(`/workteams/${data.id}/admin`);
        break;
      case 'EDIT':
        history.push(`/workteams/${data.id}/edit`);

        break;

      case 'VISIBILITY':
      case 'DELETE':
        this.setState({ showLayer: true, action, activeWT: data });
        break;
      default:
        break;
    }
  }

  onMutate(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const {
      updates,
      deleteWorkteam: deleteWT,
      updateWorkTeam: toggleWT,
    } = this.props;
    const { activeWT, action } = this.state;

    if (!updates.pending) {
      if (action === 'VISIBILITY') {
        toggleWT({
          id: activeWT.id,
          closing: !activeWT.deletedAt,
        });
      } else if (action === 'DELETE') {
        if (activeWT.deletedAt) {
          deleteWT({ id: activeWT.id });
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onAdd() {
    history.push('/admin/workteam/create');
  }

  render() {
    const { workTeams = [] } = this.props;
    const { showLayer, action, activeWT } = this.state;
    return (
      <Box column>
        {showLayer && (
          <ConfirmLayer
            note={
              action === 'VISIBILITY'
                ? `${
                    activeWT.deletedAt
                      ? 'Activate Workteam? Polls will terminate immediatly if endTime was reached while deactivated'
                      : 'Deactivate Workteam? Polls get closed!'
                  }`
                : 'EXPERIMENTAL! Deletion cannot be undone'
            }
            onClose={this.onToggleLayer}
            action={action === 'VISIBILITY' && 'change'}
            onSubmit={this.onMutate}
          />
        )}
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
          tableHeaders={['Name', 'Coordinator', 'Status', '', '']}
        />
      </Box>
    );
  }
}
const mapStateToProps = state => ({
  workTeams: getWorkTeams(state),
  updates: getWorkTeamStatus(state),
});

const mapDispatch = {
  loadWorkTeams,
  updateWorkTeam,
  deleteWorkteam,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(WorkTeamPanel));
