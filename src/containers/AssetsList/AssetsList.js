import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Box from '../../components/Box';
// import Search from '../../components/Search';
// import AssetFilterLayer from '../../components/AssetFilterLayer';
import AssetsTable from '../../components/AssetsTable';
import AssetRow from './AssetRow';

import s from './AssetsList.css';

/* const isLetter = () => {
  console.log('TO IMPLEMENT');
  return true;
}; */
class AssetsList extends React.Component {
  constructor() {
    super();
    this.interval = null;
    this.onSearch = this.onSearch.bind(this);
    this.onToggleForm = this.onToggleForm.bind(this);
    this.onChangePostTypes = this.onChangePostTypes.bind(this);
    this.onSubmitFilterForm = this.onSubmitFilterForm.bind(this);
    this.onCancelFilterForm = this.onCancelFilterForm.bind(this);
    this.onClearFilters = this.onClearFilters.bind(this);
    this.onSearchPostTypes = this.onSearchPostTypes.bind(this);
    this.onSearchKeyUp = this.onSearchKeyUp.bind(this);
    this.onSearchKeyDown = this.onSearchKeyDown.bind(this);
    this.onToggleListType = this.onToggleListType.bind(this);
    this.onSortTable = this.onSortTable.bind(this);
    this.handleKeyboardShortcut = this.handleKeyboardShortcut.bind(this);
    this.addKeyboardShortcut = this.addKeyboardShortcut.bind(this);
    this.state = {
      /*
      postTypes: {
        isFiltering: false,
        filteredOptions: [],
      }, */
    };
  }

  componentWillMount() {
    this.addKeyboardShortcut();
  }
  /*
  componentWillReceiveProps({ postTypes, searchTerm }) {
    if (postTypes && postTypes.length && postTypes !== this.props.postTypes) {
      const options = parseOptions(postTypes);
      this.props.actions.setFormOptions(options, 'postTypes');
      this.props.actions.setFormFunctions('postTypes', this.onChangePostTypes);
    }
    if (searchTerm.length < this.props.searchTerm.length) {
      this.setState({ requiresSearch: true });
    }
  } */

  componentWillUnmount() {
    this.onClearFilters();
    this.removeKeyboardShortcut();
  }
  /*
  loadAssetCategories() {
    this.props.getAssetsPostTypes();
  }

  onSubmitFilterForm() {
    this.props.toggleFilterReset();
    this.props.toggleForm();
  }

  onCancelFilterForm() {
    // this.props.clearForm();
    // this.props.getAssets();
  }

  onSearch(event) {
    const searchTerm = event.target.value || '';
    this.props.setSearchTerm(searchTerm);
  }

  onSearchKeyUp(e) {
    if (isLetter(e)) {
      this.interval = setTimeout(() => {
        this.setState({ requiresSearch: true });
      }, 1000);
    }
  }

  onSearchKeyDown(e) {
    if (isLetter(e)) {
      if (typeof this.interval !== null) {
        // eslint-disable-line
        clearTimeout(this.interval);
      }
    }
  }

  onSearchPostTypes(e) {
    const term = e.target.value;
    const re = new RegExp(term, 'gi');
    const { options } = this.props.form.postTypes.fieldProps;
    if (options && options.length) {
      const filteredOptions = options.filter(({ label }) => re.test(label));
      if (term !== '') {
        this.setState({
          postTypes: {
            isFiltering: true,
            filteredOptions,
          },
        });
      } else {
        this.setState({
          postTypes: {
            isFiltering: false,
            filteredOptions: [],
          },
        });
      }
    }
  }

  onChangePostTypes({ value }) {
    this.props.setFormFieldValue(value, 'postTypes');
  }

  onToggleForm() {
    if (this.props.toggleForm) {
      this.props.toggleForm();
    } else {
      this.setState({ layerVisible: !this.state.layerVisible });
    }
  }

  onClearFilters() {
    // this.props.setSearchTerm('');
    this.onCancelFilterForm();
  }

  onToggleListType() {
    this.props.toggleListType();
  }

  onSortTable(index, ascending) {
    this.props.setSortIndex(index);
    this.props.toggleTableSortOrder(ascending);
  }
*/
  render() {
    /*  const {
      // layerVisible,
     form,
      searchTerm,
      onAssetSelect,
      onAssetsSelect,
      tileSize,
      showControls,
      listType,
      table,
      isInLayer,
      allowMultiSelect,
    } = this.props; */
    // const { layerVisible } = this.state;
    return (
      <Box className={s.full} column fill>
        <Box pad align>
          <Box flex>
            {/* <Search
              inline
              onKeyUp={this._onSearchKeyUp}
              onKeyDown={this._onSearchKeyDown}
              value={searchTerm}
              placeHolder="Start typing to search assets..."
              onDOMChange={this._onSearch}
            /> */}
          </Box>
          {/* <AssetFilterLayer
            form={form}
            filteredOptions={this.state.postTypes.filteredOptions}
            isFiltering={this.state.postTypes.isFiltering}
            onSearchPostTypes={this.onSearchPostTypes}
            onSubmit={this.onSubmitFilterForm}
            onCancel={this.onCancelFilterForm}
            layerVisible={layerVisible}
            onToggle={this.onToggleForm}
         /> */}
          {/* <ListTypeToggle
            listType={listType}
            onToggleSelected={this._onToggleListType}
         /> */}
        </Box>
        <Box tag="article" column align>
          <AssetsTable
            onClickCheckbox={this.onClickCheckbox}
            onClickMenu={this.onProposalClick}
            allowMultiSelect
            searchTerm=""
            noRequestsFound="No requests found"
            checkedIndices={[]}
            assets={[{ id: 1 }]}
            row={AssetRow}
            tableHeaders={['', 'name', 'type', 'created at', '', '']}
          />
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  layerVisible: state.layerVisible,
  form: state.form,
  postTypes: state.postTypes,
  searchTerm: state.searchTerm,
  listType: state.listType,
  table: state.table,
});

const mapDispatch = {};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(AssetsList));
