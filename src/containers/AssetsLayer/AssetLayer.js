import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Box from '../../components/Box';
import Button from '../../components/Button';
import Layer from '../../components/Layer';
import AssetsList from '../AssetsList';
import AssetForm from '../AssetForm';
import { loadAssetList } from '../../actions/asset';

class AssetsLayer extends React.Component {
  static propTypes = {
    loadAssetList: PropTypes.func.isRequired,
    onAssetSelect: PropTypes.func.isRequired,
    onAssetsSelect: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    updates: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
  };
  static defaultProps = {
    onAssetsSelect: null,
  };
  constructor(props) {
    super(props);
    this.onAddAssetClick = this.onAddAssetClick.bind(this);

    this.state = {
      addNewAsset: false,
    };
  }

  onAssetFormSubmit() {
    // Refresh Assets list.
    this.props.loadAssetList().then(() => {
      this.setState({ addNewAsset: false });
    });
  }

  onAddAssetClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({ addNewAsset: true });
  }

  onAssetFormCancel() {
    this.setState({ addNewAsset: false });
  }

  render() {
    const onAssetFormSubmit = !this.props.updates.pending
      ? this.onAssetFormSubmit
      : undefined;
    const assetForm = this.state.addNewAsset ? (
      <Box tag="article" fill align justify>
        <AssetForm
          isLayer
          hasHeader={false}
          params={{ id: 'create' }}
          onCancel={this.onAssetFormCancel}
          onSubmit={onAssetFormSubmit}
        />
      </Box>
    ) : (
      undefined
    );

    return (
      <Layer align="center" flush onClose={this.props.onClose}>
        <Box pad>
          <Button onClick={this.onAddAssetClick}>Add Asset</Button>
          <Button onClick={this.props.onClose}>Exit</Button>
        </Box>

        {!this.state.addNewAsset && (
          <AssetsList
            isInLayer
            allowMultiSelect={typeof this.props.onAssetsSelect !== 'undefined'}
            tileSize="medium"
            showControls={false}
            onAssetSelect={this.props.onAssetSelect}
            onAssetsSelect={this.props.onAssetsSelect}
          />
        )}
        {assetForm}
      </Layer>
    );
  }
}

function mapStateToProps(state) {
  const { error, request } = state;

  return {
    error,
    request,
  };
}

const mapDispatch = {
  loadAssetList,
};

export default connect(mapStateToProps, mapDispatch)(AssetsLayer);
