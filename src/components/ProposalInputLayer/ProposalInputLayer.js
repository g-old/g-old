import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';
import Box from '../Box';
import Layer from '../Layer';
import Button from '../Button';
import ProposalInput from '../ProposalInput';
import withPollSettings from '../ProposalInput/withPollSettings';
import s from './ProposalInputLayer.css';
import { loadTags } from '../../actions/proposal';

const ProposalInputAllSettings = withPollSettings(ProposalInput);

class ProposalInputLayer extends React.Component {
  constructor() {
    super();
    this.state = { open: false };
    this.toggleLayer = this.toggleLayer.bind(this);
  }

  toggleLayer() {
    const { open } = this.state;
    if (!open) {
      // TODO make sure it waits if a call is pending
      // eslint-disable-next-line react/destructuring-assignment
      this.props.loadTags();
    }
    this.setState(prevState => ({
      open: !prevState.open,
    }));
  }

  render() {
    const { open } = this.state;
    if (open) {
      return (
        <Layer fill onClose={this.toggleLayer}>
          <ProposalInputAllSettings defaultPollType="voting" />
        </Layer>
      );
    }
    return (
      <Box justify fill className={s.container}>
        <Button primary onClick={this.toggleLayer}>
          Vorschlag hinzufügen
        </Button>
      </Box>
    );
  }
}

ProposalInputLayer.propTypes = {
  loadTags: PropTypes.func.isRequired,
};
const mapDispatch = {
  loadTags,
};

export default connect(
  null,
  mapDispatch,
)(withStyles(s)(ProposalInputLayer));