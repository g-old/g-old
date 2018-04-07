import React from 'react';
import PropTypes from 'prop-types';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedRelative } from 'react-intl';
import TableRow from '../../components/TableRow';
import CheckBox from '../../components/CheckBox';

function AssetRow({ asset = {}, onClickMenu, checked }) {
  /* eslint-disable react/no-danger */
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

  return (
    <TableRow onClick={() => onClickMenu('EDIT')}>
      <td>asset-preview-img</td>
      <td style={{ minWidth: '84px' }}>{asset.name}</td>
      <td>
        <span>{asset.type}</span>
      </td>
      <td>
        <FormattedRelative value={asset.createdAt} />
      </td>
      <td>
        <CheckBox value={checked} label="" />
      </td>
    </TableRow>
  );
}

AssetRow.propTypes = {
  onClickMenu: PropTypes.func.isRequired,
  asset: PropTypes.shape({}).isRequired,
  checked: PropTypes.bool,
};

AssetRow.defaultProps = {
  checked: null,
};

export default AssetRow;
