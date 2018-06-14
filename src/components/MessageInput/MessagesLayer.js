import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import { getAllMessages } from '../../reducers';
import { loadMessages } from '../../actions/message';
import AssetsTable from '../AssetsTable';
import MessageRow from './MessageRow';
import Heading from '../Heading';
import Select from '../Select';
import Box from '../Box';
import CheckBox from '../CheckBox';

class MessagesLayer extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    loadMessages: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      category: 'CIRCULAR',
      isPublished: false,
      filteredMessages: props.messages
        ? props.messages.filter(
            m =>
              m.messageObject.category === 'CIRCULAR' &&
              m.messageObject.isPublished === false,
          )
        : [],
    };
    this.handleFilterChanges = this.handleFilterChanges.bind(this);
  }

  componentDidMount() {
    this.props.loadMessages({ messageType: 'NOTE', isPublished: false });
  }

  componentWillReceiveProps({ messages }) {
    if (messages !== this.props.messages) {
      this.setState({
        filteredMessages: messages.filter(
          m =>
            m.messageObject.category === this.state.category &&
            m.messageObject.isPublished === this.state.isPublished,
        ),
      });
    }
  }

  handleFilterChanges(e) {
    let value;
    switch (e.target.type) {
      case 'checkbox':
        value = !this.state.isPublished;
        break;

      default:
        ({ value } = e.target);
    }
    this.setState({ [e.target.name]: value }, () =>
      this.props.loadMessages({
        messageType: 'NOTE',
        isPublished: this.state.isPublished,
        category: this.state.category,
      }),
    );
  }

  render() {
    return (
      <Layer onClose={this.props.onClose}>
        <Box column>
          <Heading tag="h3"> Drafts </Heading>
          <Box align wrap>
            <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <span style={{ maxWidth: '10em' }}>
                <Select
                  value={this.state.category}
                  onChange={e => {
                    this.handleFilterChanges({
                      target: { name: 'category', value: e.value },
                    });
                  }}
                  options={['CIRCULAR', 'GROUPS']}
                />
              </span>
            </div>
            <CheckBox
              label="Published"
              checked={this.state.isPublished}
              onChange={this.handleFilterChanges}
              name="isPublished"
            />
          </Box>
          <Box>
            <AssetsTable
              onClickCheckbox={this.onClickCheckbox}
              onClickMenu={this.props.onSelection}
              searchTerm=""
              noRequestsFound="No messages found"
              checkedIndices={[]}
              assets={this.state.filteredMessages || []}
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
          </Box>
        </Box>
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
