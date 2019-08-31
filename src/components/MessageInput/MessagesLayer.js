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
    // eslint-disable-next-line react/destructuring-assignment
    this.props.loadMessages({ messageType: 'NOTE', isPublished: false });
  }

  componentWillReceiveProps({ messages }) {
    // eslint-disable-next-line react/destructuring-assignment
    if (messages !== this.props.messages) {
      this.setState(prevState => ({
        filteredMessages: messages.filter(
          m =>
            m.messageObject.category === prevState.category &&
            m.messageObject.isPublished === prevState.isPublished,
        ),
      }));
    }
  }

  handleFilterChanges(e) {
    let value;
    switch (e.target.type) {
      case 'checkbox':
        // eslint-disable-next-line react/destructuring-assignment
        value = !this.state.isPublished;
        break;

      default:
        ({ value } = e.target);
    }
    this.setState({ [e.target.name]: value }, () =>
      // eslint-disable-next-line react/destructuring-assignment
      this.props.loadMessages({
        messageType: 'NOTE',
        // eslint-disable-next-line react/destructuring-assignment
        isPublished: this.state.isPublished,
        // eslint-disable-next-line react/destructuring-assignment
        category: this.state.category,
      }),
    );
  }

  render() {
    const { onClose, onSelection } = this.props;
    const { category, isPublished, filteredMessages } = this.state;

    return (
      <Layer onClose={onClose}>
        <Box column>
          <Heading tag="h3"> Drafts </Heading>
          <Box align wrap>
            <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <span style={{ maxWidth: '10em' }}>
                <Select
                  value={category}
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
              checked={isPublished}
              onChange={this.handleFilterChanges}
              name="isPublished"
            />
          </Box>
          <Box>
            <AssetsTable
              onClickCheckbox={this.onClickCheckbox}
              onClickMenu={onSelection}
              searchTerm=""
              noRequestsFound="No messages found"
              checkedIndices={[]}
              assets={filteredMessages || []}
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

export default connect(
  mapStateToProps,
  mapDispatch,
)(MessagesLayer);
