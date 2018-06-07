import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import { getAllMessages } from '../../reducers';
import { loadMessages } from '../../actions/message';
import AssetsTable from '../AssetsTable';
import MessageRow from './MessageRow';
import Heading from '../Heading';

class MessagesLayer extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
    messages: PropTypes.shape({}).isRequired,
    loadMessages: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.loadMessages({ messageType: 'NOTE', isPublished: false });
  }
  render() {
    return (
      <Layer onClose={this.props.onClose}>
        <Heading tag="h3"> Drafts </Heading>
        <AssetsTable
          onClickCheckbox={this.onClickCheckbox}
          onClickMenu={this.props.onSelection}
          searchTerm=""
          noRequestsFound="No messages found"
          checkedIndices={[]}
          assets={this.props.messages || []}
          row={MessageRow}
          tableHeaders={[
            'content',
            'messageType',
            'keyword',
            'category',
            'published',
            'hm',
          ]}
        />
      </Layer>
    );
  }
}
const mapStateToProps = state => ({
  messages: getAllMessages(state),
});

const mapDispatch = {
  loadMessages,
};

export default connect(mapStateToProps, mapDispatch)(MessagesLayer);
