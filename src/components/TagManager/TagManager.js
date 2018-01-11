import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createTag, updateTag, deleteTag } from '../../actions/tag';
import { getTags, getTagStatus } from '../../reducers';
import Button from '../Button';
import Box from '../Box';
import TagForm from '../TagForm';
import TagTable from '../TagTable';

class TagManager extends React.Component {
  static propTypes = {
    tagUpdates: PropTypes.shape({}),
    updateTag: PropTypes.func.isRequired,
    createTag: PropTypes.func.isRequired,
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
  }

  onTagClick(action, data) {
    this.setState({ showTag: true, currentTag: data });
  }
  onCancelClick() {
    this.setState({ showTag: false });
  }

  onCreateTagClick() {
    this.setState({ showTag: true, currentTag: {} });
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
