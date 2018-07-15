import React from 'react';
import PropTypes from 'prop-types';
import Request from '../../components/Request';
import AssetsTable from '../../components/AssetsTable';
import RequestRow from './RequestRow';

const RequestsView = ({
  showRequest,
  updates,
  request,
  onAllowRequest,
  onDenyRequest,
  onCancel,
  onRequestClick,
  requests,
}) => {
  if (showRequest) {
    return (
      <Request
        onAllow={onAllowRequest}
        onDeny={onDenyRequest}
        onCancel={onCancel}
        {...request}
        updates={updates}
      />
    );
  }
  return (
    <AssetsTable
      onClickMenu={onRequestClick}
      allowMultiSelect
      searchTerm=""
      noRequestsFound="No requests found"
      checkedIndices={[]}
      assets={requests || []}
      row={RequestRow}
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
};

RequestsView.propTypes = {
  showRequest: PropTypes.func.isRequired,
  updates: PropTypes.shape({}).isRequired,
  request: PropTypes.shape({}).isRequired,
  onAllowRequest: PropTypes.func.isRequired,
  onDenyRequest: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRequestClick: PropTypes.func.isRequired,
  requests: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default RequestsView;
