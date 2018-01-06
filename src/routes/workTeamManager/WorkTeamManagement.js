import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeam } from '../../actions/workTeam';
import { loadRequestList, deleteRequest } from '../../actions/request';
import { getWorkTeam, getVisibleRequests } from '../../reducers';
import DiscussionInput from '../../components/DiscussionInput';
import Tabs from '../../components/Tabs';
import Tab from '../../components/Tab';
import RequestsList from '../../components/RequestsList';
import Request from '../../components/Request';

// import FetchError from '../../components/FetchError';

class WorkTeamManagement extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    loadRequestList: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
    requests: PropTypes.arrayOf(PropTypes.shape({})),
  };

  static defaultProps = {
    requests: null,
  };
  constructor(props) {
    super(props);
    this.state = { showRequest: false };
    this.onRequestClick = this.onRequestClick.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onAllowRequest = this.onAllowRequest.bind(this);
  }
  componentDidMount() {
    this.props.loadRequestList({ first: 10 });
  }

  onRequestClick(action, data) {
    this.setState({ showRequest: true, currentRequest: data });
  }
  onAllowRequest() {
    const { type, id } = this.state.currentRequest;
    if (type === 'joinWT') {
      this.props.deleteRequest({ id });
    }
  }

  onCancel() {
    this.setState({ showRequest: false });
  }
  render() {
    let userTab;
    if (this.state.showRequest) {
      userTab = (
        <Request
          onAllow={this.onAllowRequest}
          onCancel={this.onCancel}
          {...this.state.currentRequest}
        />
      );
    } else {
      userTab = (
        <RequestsList
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.onRequestClick}
          allowMultiSelect
          searchTerm=""
          checkedIndices={[]}
          requests={this.props.requests || []}
          tableHeaders={[
            'name',
            'request',
            'processor',
            'created_at',
            'denied_at',
            '',
            '',
          ]}
        />
      );
    }
    return (
      <Tabs>
        <Tab title="Discussions">
          <div>
            <DiscussionInput workTeamId={this.props.id} />
          </div>
        </Tab>
        <Tab title="User">{userTab}</Tab>
      </Tabs>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeamData: getWorkTeam(state, id),
  requests: getVisibleRequests(state, 'all'),
});

const mapDispatch = {
  loadWorkTeam,
  loadRequestList,
  deleteRequest,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamManagement);
