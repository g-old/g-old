import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createTag, updateTag, deleteTag } from '../../actions/tag';
import { getTags, getTagStatus } from '../../reducers';
import Button from '../Button';
import Box from '../Box';
import TagForm from '../TagForm';
import TagTable from '../TagTable';
import ConfirmLayer from '../ConfirmLayer';

class TagManager extends React.Component {
  static propTypes = {
    tagUpdates: PropTypes.shape({
      success: PropTypes.bool,
      pending: PropTypes.bool,
    }),
    updateTag: PropTypes.func.isRequired,
    createTag: PropTypes.func.isRequired,
    deleteTag: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    tagUpdates: null,
    tags: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.onTagClick = this.onTagClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
    this.onCreateTagClick = this.onCreateTagClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onLayerClose = this.onLayerClose.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onTagClick(action, data) {
    if (action === 'DELETE') {
      this.onDeleteClick(data);
    } else {
      this.setState({ showTag: true, currentTag: data });
    }
  }
  onCancelClick() {
    this.setState({ showTag: false });
  }

  onDeleteClick(data) {
    this.setState({ showLayer: true, currentTag: data });
  }

  onCreateTagClick() {
    this.setState({ showTag: true, currentTag: {} });
  }

  onLayerClose() {
    this.setState({ showLayer: false, showTag: false });
  }
  onDelete() {
    this.props.deleteTag({ id: this.state.currentTag.id });
  }

  render() {
    if (this.state.showTag) {
      return (
        <TagForm
          tag={this.state.currentTag}
          updates={this.props.tagUpdates || {}}
          updateTag={this.props.updateTag}
          createTag={this.props.createTag}
          onCancel={this.onCancelClick}
        />
      );
    }

    return (
      <Box column>
        {this.state.showLayer && (
          <ConfirmLayer
            success={this.props.tagUpdates.success}
            pending={this.props.tagUpdates.pending}
            onSubmit={this.onDelete}
            onClose={this.onLayerClose}
          />
        )}
        <Button icon={'+'} label={'Add Tag'} onClick={this.onCreateTagClick} />
        <TagTable
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.onTagClick}
          allowMultiSelect
          searchTerm=""
          noRequestsFound={'No requests found'}
          checkedIndices={[]}
          tags={this.props.tags || []}
          tableHeaders={[
            'default',
            'name german',
            'name italian',
            'name ladin',
            'count',
            '',
          ]}
        />
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  tags: getTags(state),
  tagUpdates: getTagStatus(state),
});

const mapDispatch = {
  createTag,
  updateTag,
  deleteTag,
};

export default connect(mapStateToProps, mapDispatch)(TagManager);
