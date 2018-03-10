import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GroupPanel.css';
import Box from '../Box';
import GroupsList from '../GroupsList';
import { loadGroups } from '../../actions/group';
import { getGroups } from '../../reducers';
import history from '../../history';
import Button from '../Button';

class GroupPanel extends React.Component {
  static propTypes = {
    loadGroups: PropTypes.func.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  componentDidMount() {
    this.props.loadGroups();
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
    const { groups = [] } = this.props;

    return (
      <Box column>
        <Box>
          <Button icon={'+'} onClick={this.onAdd}>
            {'Add Workteam'}
          </Button>
        </Box>
        <GroupsList
          groups={groups}
          onClickMenu={this.onMenuClick}
          allowMultiSelect
          searchTerm=""
          checkedIndices={[]}
          tableHeaders={[
            'name',
            'coordinator',
            'restricted',
            'members',
            'discussions',
            '',
          ]}
        />
      </Box>
    );
  }
}
const mapStateToProps = state => ({
  groups: getGroups(state),
});

const mapDispatch = {
  loadGroups,
};

export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(GroupPanel),
);
